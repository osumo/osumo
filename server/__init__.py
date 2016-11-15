
import copy
import inspect
import os
import tempfile

from girder import events
from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource, RestException
from girder.constants import AccessType, TokenScope
from girder.utility.model_importer import ModelImporter

from girder.plugins.worker import utils as workerUtils

from .job_specs import job_specs


class Osumo(Resource):
    # NOTE(opadron): 'tools.staticdir.dir' is set in load()
    _cp_config = {'tools.staticdir.on': True,
                  'tools.staticdir.index': 'index.html'}

    def __init__(self):
        super(Osumo, self).__init__()
        self.resourceName = 'osumo'
        self.route('GET', ('tasks', ), self.getTasks)
        self.route('POST', (), self.processTask)
        # This should change if we add a custom token per job.
        self.jobInfo = {}

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
