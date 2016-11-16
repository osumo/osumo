
import copy
import inspect
import json
import os
import re
import tempfile

RE_ARG_SPEC = re.compile(r'''([^\(]+)(\((.+)\))?''')

from girder import events
from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource, RestException
from girder.constants import AccessType, TokenScope
from girder.utility.model_importer import ModelImporter

from girder.plugins.worker import utils as workerUtils

from .job_specs import job_specs
from .task_specs import task_specs


class Osumo(Resource):
    # NOTE(opadron): 'tools.staticdir.dir' is set in load()
    _cp_config = {'tools.staticdir.on': True,
                  'tools.staticdir.index': 'index.html'}

    def __init__(self):
        super(Osumo, self).__init__()
        self.resourceName = 'osumo'
        self.route('GET', ('tasks', ), self.getTasks)
        self.route('POST', (), self.processTask)

        self.route('GET', ('task_spec', ':name'), self.getTaskSpecByName)
        self.route('GET', ('task_spec', ), self.getTaskSpecs)
        self.route('POST', ('task_spec', ':name', 'run'), self.runTaskSpec)


        # This should change if we add a custom token per job.
        self.jobInfo = {}

    @describeRoute(
        Description('Fetch task spec with the given name.')
        .param('name', 'Name of the task', paramType='path')
        .param(
            'index',
            (
                'Index to use in the case of multiple'
                ' task specs with the same name'
            ),
            default='0',
            required=False
        )
        .errorResponse('Task not found.', 404)
    )
    @access.public
    def getTaskSpecByName(self, name, params, **kwargs):
        index = int(params['index'])
        name = name.lower()

        task_list = [
            c for (a, b, c) in sorted(
                (
                    task.get('name', key).lower(),
                    task.get('name', key),
                    task
                )
                for key, task in task_specs.items()
            )
            if a == name
        ]

        if task_list[index:]:
            return task_list[index]

        raise RestException('Task not found.', 404)

    @describeRoute(
        Description('Find task specs that match the given parameters.')
        .param('name', 'Name of the task', required=False)
        .param('mode', 'Task execution mode', required=False)
    )
    @access.public
    def getTaskSpecs(self, params, **kwargs):
        name = params.get('name', '').lower()
        mode = params.get('mode', '').lower()

        return [
            c for (a, b, c, d) in sorted(
                (
                    task.get('name', key).lower(),
                    task.get('name', key),
                    task,
                    task.get('mode', '').lower()
                )
                for key, task in task_specs.items()
            )
            if (not name or a == name) and (not mode or d == mode)
        ]

    @access.public
    @describeRoute(
        Description('Create a job from the given task spec')
        .notes('Each task takes a variety of input parameters.  See the '
               'appropriate task specification.')
        .param('name', 'Name of the task', paramType='path')
        .param('title', 'Title of the job', required=False)
    )
    def runTaskSpec(self, name, params, **kwargs):
        task_spec = task_specs.get(name)
        if task_spec is None:
            raise RestException('No task named %s.' % name)

        # validate input bindings
        for input_spec in task_spec['inputs']:
            input_name = input_spec['name']
            input_key = 'INPUT({})'.format(input_name)

            try:
                payload = params[input_key]
            except KeyError:
                # Check to see if the input spec provides a default.
                # If not, raise an exception.
                if 'default' not in input_spec:
                    raise RestException(
                            'No binding provided for input "{}".'.format(
                                input_name))

            if RE_ARG_SPEC.match(payload) is None:
                raise RestException(
                        'invalid payload for input "{}": "{}"'.format(
                            input_name, payload))

        # validate output bindings
        for output_spec in task_spec['outputs']:
            output_name = output_spec['name']
            output_key = 'OUTPUT({})'.format(output_name)

            try:
                payload = params[output_key]
            except KeyError:
                continue

            if RE_ARG_SPEC.match(payload) is None:
                raise RestException(
                        'invalid payload for output "{}": "{}"'.format(
                            output_name, payload))

        #
        # validation complete
        #

        job_title = params.get('title', 'sumo {}'.format(task_spec['name']))

        user, token = self.getCurrentUser(True)

        job = self.model('job', 'jobs').createJob(
            title=job_title, type='sumo', user=user, handler='worker_handler')

        jobToken = self.model('job', 'jobs').createJobToken(job)

        job['kwargs']['jobInfo'] = workerUtils.jobInfoSpec(
            job=job,
            token=jobToken,
            logPrint=True)

        if not token:
            # It seems like we should be able to use a token without USER_AUTH
            # in its scope, but I'm not sure how.
            token = self.model('token').createToken(
                user, days=1, scope=TokenScope.USER_AUTH)

        job_inputs = {}
        for input_spec in task_spec['inputs']:
            input_name = input_spec['name']
            input_key = 'INPUT({})'.format(input_name)

            payload = params.get(input_key)
            if payload is None:
                continue

            job_input = {}

            m = RE_ARG_SPEC.match(payload)
            pos_args, extra_args = m.group(1), m.group(3)
            pos_args = pos_args.split(':')
            if extra_args:
                extra_args = json.loads(extra_args)
            else:
                extra_args = {}

            input_type = pos_args[0]

            if input_type in ('FILE', 'ITEM'):
                resource_id = pos_args[1]
                resource_type = input_type.lower()
                data_type = extra_args.get(
                        'type', input_spec.get('type', 'string'))
                data_format = extra_args.get(
                        'format', input_spec.get('format', 'text'))

                job_input.update(
                        workerUtils.girderInputSpec(
                            self._getResource(resource_type, resource_id, user),
                            resourceType=resource_type,
                            token=token,
                            dataType=data_type,
                            dataFormat=data_format))

            elif input_type == 'HTTP':
                # TODO(opadron): maybe we'll want to implement this, someday?
                raise NotImplementedError('HTTP input not implemented')

            elif input_type == 'INTEGER':
                value = pos_args[1]
                job_input['type'] = 'number'
                job_input['format'] = 'number'
                job_input['mode'] = 'inline'
                job_input['data'] = int(value)

            elif input_type == 'FLOAT':
                value = pos_args[1]
                job_input['type'] = 'number'
                job_input['format'] = 'number'
                job_input['mode'] = 'inline'
                job_input['data'] = float(value)

            elif input_type == 'STRING':
                job_input['type'] = 'string'
                job_input['format'] = 'text'
                job_input['mode'] = 'inline'
                job_input['data'] = value

            else:
                raise NotImplementedError(
                        'Input type "{}" not supported'.format(input_type))

            job_input.update(extra_args)
            job_inputs[input_name] = job_input

        job_outputs = {}
        for output_spec in task_spec['outputs']:
            output_name = output_spec['name']
            output_key = 'OUTPUT({})'.format(output_name)

            payload = params.get(output_key)
            if payload is None:
                continue

            job_output = {}

            m = RE_ARG_SPEC.match(payload)
            pos_args, extra_args = m.group(1), m.group(3)
            pos_args = pos_args.split(':')
            if extra_args:
                extra_args = json.loads(extra_args)
            else:
                extra_args = {}

            output_type = pos_args[0]

            if output_type in ('FILE', 'ITEM'):
                parent_id, resource_name = (pos_args + [None])[1:3]
                parent_type = ('folder' if output_type == 'FILE' else 'file')
                data_type = extra_args.get(
                        'type', output_spec.get('type', 'string'))
                data_format = extra_args.get(
                        'format', output_spec.get('format', 'text'))

                parent = self._getResource(parent_type, parent_id, user)
                job_output.update(
                        workerUtils.girderOutputSpec(
                            parent,
                            parentType=parent_type,
                            token=token,
                            name=resource_name,
                            dataType=data_type,
                            dataFormat=data_format))

            else:
                raise NotImplementedError(
                        'Output type "{}" not supported'.format(output_type))

            job_output.update(extra_args)
            job_outputs[output_name] = job_output

        job['kwargs'].update(
            task=task_spec,
            inputs=job_inputs,
            outputs=job_outputs
        )

        job = self.model('job', 'jobs').save(job)
        self.model('job', 'jobs').scheduleJob(job)
        self.jobInfo[str(job['_id'])] = {'user': user}

        return {
            'job': self.model('job', 'jobs').filter(job, user),
            'token': str(token['_id'])
        }

    def _getResource(self, type, id, user):
        """
        Get a Girder resource.  If a file is requested and the id is from an
        item, and that item has a single file, use the file.

        :param type: the girder resource type.
        :param id: id of the resource.
        :param used: the user used for permissions.
        :returns: a girder resource or None.
        """
        loadFunc = self.model(type).load
        kwargs = {}
        if 'level' in inspect.getargspec(loadFunc).args:
            kwargs['level'] = AccessType.READ
        value = loadFunc(id, user=user, exc=(type != 'file'), **kwargs)
        if type == 'file' and value is None:
            # If we want a file, allow a one-file item to be used
            # instead
            item = self.model('item').load(id, user=user,
                                           level=AccessType.READ)
            if item:
                files = list(self.model('item').childFiles(item))
                if len(files) == 1:
                    value = self.model('file').load(
                        files[0]['_id'], user=user, level=AccessType.READ)
        return value

    @describeRoute(
        Description('List available tasks')
    )
    @access.public
    def getTasks(self, *args, **kwargs):
        return [
            row[-1] for row in sorted(
                (
                    task.get('name', key).lower(),
                    task.get('name', key),
                    task
                )
                for key, task in job_specs.items()
            )
        ]

    @access.public
    @describeRoute(
        Description('Process a task')
        .notes('Each task takes a variety of input parameters.  See the '
               'appropriate task specification.')
        .param('task', 'Name of the task to process.', required=True)
    )
    def processTask(self, params, **kwargs):
        self.requireParams(('task', ), params)
        task_name = params['task']
        task_spec = job_specs.get(task_name)

        if task_spec is None:
            raise RestException('No task named %s.' % task_name)

        user, token = self.getCurrentUser(True)

        job = self.model('job', 'jobs').createJob(
            title='sumo %s' % task_spec['name'],
            type='sumo',
            user=user,
            handler='worker_handler')

        jobToken = self.model('job', 'jobs').createJobToken(job)

        job['kwargs']['jobInfo'] = workerUtils.jobInfoSpec(
            job=job,
            token=jobToken,
            logPrint=True)

        if not token:
            # It seems like we should be able to use a token without USER_AUTH
            # in its scope, but I'm not sure how.
            token = self.model('token').createToken(
                user, days=1, scope=TokenScope.USER_AUTH)

        job['kwargs']['inputs'] = {}
        for key in task_spec['inputs']:
            job['kwargs']['inputs'][key] = {}

            value = params[key].split(':')
            if len(value) == 1:
                value = ['string'] + value

            type, value = value[:2]

            if type in ('file', 'item', 'folder'):
                value = self._getResource(type, value, user)
                value = workerUtils.girderInputSpec(
                    value, resourceType=type,
                    token=token,
                    dataType='string',
                    dataFormat='text'
                )

            elif type == 'integer':
                value = int(value)

            elif type == 'boolean':
                value = 'true' if value in (True, 'true') else 'false'

            elif type == 'temppath':
                file = tempfile.NamedTemporaryFile(
                    suffix=value if value is not None else '')
                value = file.name
                file.close()

                job['kwargs']['inputs'][key]['format'] = 'text'
                job['kwargs']['inputs'][key]['type'] = 'string'

            elif type in ('enum', 'string', 'text'):
                job['kwargs']['inputs'][key]['format'] = 'text'
                job['kwargs']['inputs'][key]['type'] = 'string'

            else:
                raise NotImplementedError('No input data type %s' % type)

            job['kwargs']['inputs'][key]['data'] = value

        job['kwargs']['outputs'] = {}
        for key in task_spec['inputs']:
            job['kwargs']['inputs'][key] = {}

            value = params[key].split(':')
            if len(value) == 1:
                value = ['string'] + value

            type, value = value[:2]

            if type in ('file', 'item', 'folder'):
                value = self._getResource(type, value, user)
                value = workerUtils.girderInputSpec(
                    value, resourceType=type,
                    token=token,
                    dataType='string',
                    dataFormat='text'
                )

            elif type == 'integer':
                value = int(value)

            elif type == 'boolean':
                value = 'true' if value in (True, 'true') else 'false'

            elif type == 'temppath':
                file = tempfile.NamedTemporaryFile(
                    suffix=value if value is not None else '')
                value = file.name
                file.close()

                job['kwargs']['inputs'][key]['format'] = 'text'
                job['kwargs']['inputs'][key]['type'] = 'string'

            elif type in ('enum', 'string', 'text'):
                job['kwargs']['inputs'][key]['format'] = 'text'
                job['kwargs']['inputs'][key]['type'] = 'string'

            else:
                raise NotImplementedError('No input data type %s' % type)

            job['kwargs']['inputs'][key]['data'] = value

        # TODO(opadron): make a special-purpose token just for this job in case
        # the user logs out before it finishes.
        outputs = {}
        for output in task.get('outputs', {}):
            key = output['key']
            spec = {'token': token}
            for subkey in output:
                if (subkey in inspect.getargspec(
                        workerUtils.girderOutputSpec).args):
                    value = output[subkey]
                    if value.startswith('parameter:'):
                        valuekey = value.split(':', 1)[1]
                        value = data.get(valuekey, {}).get('data')
                    spec[subkey] = value
            outputs[key] = workerUtils.girderOutputSpec(**spec)

        job['kwargs'].update(task=task['task'], inputs=inputs, outputs=outputs)

        job = self.model('job', 'jobs').save(job)
        self.model('job', 'jobs').scheduleJob(job)
        self.jobInfo[str(job['_id'])] = {'user': user}

        return {
            'job': self.model('job', 'jobs').filter(job, user),
            'token': str(token['_id'])
        }

    def dataProcess(self, event):
        """
        Called when a file is uploaded.  If it is from one of our jobs, record
        the details.

        :param event: the event with the file information.
        """
        reference = event.info['reference']
        jobInfo = self.jobInfo.get(reference)
        if jobInfo is None:
            # Not our job
            return
        job = self.model('job', 'jobs').load(
            id=reference, user=jobInfo['user'], level=AccessType.ADMIN,
            fields={'processedFiles', 'kwargs', 'userId', 'type', 'status'})
        if not job:
            return
        files = job.get('processedFiles', [])
        files.append({
            'fileId': event.info['file']['_id'],
            'itemId': event.info['file']['itemId'],
            'name': event.info['file']['name']
        })
        self.model('job', 'jobs').updateJob(
            job, otherFields={'processedFiles': files},
            log='Added processed file %s' % event.info['file']['name'])


def load(info):
    ModelImporter.model('job', 'jobs').exposeFields(
        level=AccessType.ADMIN, fields='processedFiles')
    ModelImporter.model('job', 'jobs').exposeFields(
        level=AccessType.SITE_ADMIN, fields='processedFiles')

    Osumo._cp_config['tools.staticdir.dir'] = os.path.join(
        os.path.relpath(info['pluginRootDir'],
                        info['config']['/']['tools.staticdir.root']),
        'web-external')

    # Move girder app to /girder, serve sumo app from /
    info['apiRoot'].osumo = Osumo()

    (
        info['serverRoot'],
        info['serverRoot'].girder
    ) = (
        info['apiRoot'].osumo,
        info['serverRoot']
    )

    info['serverRoot'].api = info['serverRoot'].girder.api
    info['serverRoot'].girder.api

    events.bind('data.process', 'osumo', info['apiRoot'].osumo.dataProcess)
