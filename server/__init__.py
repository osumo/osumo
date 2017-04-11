
import copy
import inspect
import json
import os
import re
import tempfile

from six.moves import urllib

RE_ARG_SPEC = re.compile(r'''([^\(]+)(\((.+)\))?''')

from bson import json_util
from bson.objectid import ObjectId
from girder import events, logprint
from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource, RestException, setCurrentUser, getCurrentUser
from girder.constants import AccessType, TokenScope
from girder.utility.config import getConfig
from girder.utility.model_importer import ModelImporter
from girder.utility.plugin_utilities import registerPluginWebroot
from girder.plugins.worker import utils as workerUtils

from .task_specs import task_specs
from .ui_specs import ui_specs

class Osumo(Resource):
    # NOTE(opadron): 'tools.staticdir.dir' is set in load()
    _cp_config = {'tools.staticdir.on': True,
                  'tools.staticdir.index': 'index.html'}

    def __init__(self, anonuser):
        super(Osumo, self).__init__()
        self.resourceName = 'osumo'
        self.route('GET', ('task', ':key'), self.getTaskSpecByKey)
        self.route('GET', ('task',), self.getTaskSpecs)
        self.route('POST', ('task', ':key', 'run'), self.runTaskSpec)
        self.route('GET', ('results', ':jobId'), self.getTaskResults)
        self.route('GET', ('ui', ':key'), self.getUISpecByKey)
        self.route('GET', ('ui',), self.getUISpecs)
        self.route('POST', ('anonlogin',), self.anonymousLogin)
        self.route('GET', ('user', 'me'), self.getMe)

        self.anonuser = anonuser

    @describeRoute(
        Description('Log in using the "anonymous user".')
    )
    @access.public
    def anonymousLogin(self, params):
        user_model = self.model('user')
        user = user_model.findOne({
            'login': self.anonuser
        })
        user = user_model.filter(user, user)

        setCurrentUser(user)
        token = self.sendAuthTokenCookie(user)

        return {
            'user': self.model('user').filter(user, user),
            'authToken': {
                'token': token['_id'],
                'expires': token['expires'],
                'scope': token['scope']
            },
            'message': 'Anonymous login succeeded.'
        }

    @describeRoute(
        Description('Query for the currently logged in user, including a flag for whether this is the "anonymous user".')
    )
    @access.public
    def getMe(self, params):
        rawuser = getCurrentUser()
        user = self.model('user').filter(rawuser, rawuser)
        user['anonymous'] = user['login'] == self.anonuser
        return user

    @describeRoute(
        Description('Return job status and list of output files.')
            .param('jobId', 'Id of the job', paramType='path')
            .errorResponse('Job not found.', 404)
    )
    @access.public
    def getTaskResults(self, jobId, params, **kwargs):
        jobId = ObjectId(jobId)
        jobuser = self.model('jobuser', 'osumo').findOne({'jobId': jobId})
        jobpayload = (
                self.model('jobpayload', 'osumo').findOne({'_jobId': jobId}))
        job = self.model('job', 'jobs').findOne({'_id': jobId})
        job['kwargs'] = json_util.loads(job['kwargs'])

        if not jobuser:
            raise RestException('Job result not found.', 404)

        result = {'status': job['status']}
        if result['status'] == 3:  # success
            processedFiles = jobuser.get('processedFiles', [])
            payload = {}

            for (output_variable, output) in job['kwargs']['outputs'].items():
                mode = output.get('mode')

                if mode == 'girder':
                    for f in processedFiles:
                        if f['name'] == output.get('name'):
                            payload[output_variable] = {'mode': 'girder'}
                            payload[output_variable].update(f)
                            break
                elif mode == 'sumo':
                    converter = output.get('converter')
                    data = jobpayload[output_variable]

                    payload[output_variable] = {'mode': 'inline'}
                    payload[output_variable]['data'] = data

            result['results'] = payload

        return result

    @describeRoute(
        Description('Fetch task spec with the given name.')
        .param('key', 'Key of the task', paramType='path')
        .errorResponse('Task not found.', 404)
    )
    @access.public
    def getTaskSpecByKey(self, key, params, **kwargs):
        key = key.lower()

        task_list = [
            c for (a, b, c) in sorted(
                (
                    task.get('key', k).lower(),
                    task.get('key', k),
                    task
                )
                for k, task in task_specs.items()
            )
            if a == key
        ]

        if task_list:
            return task_list[0]

        raise RestException('Task not found.', 404)

    @describeRoute(
        Description('Fetch UI spec with the given key.')
        .param('key', 'Key of the UI', paramType='path')
        .errorResponse('UI not found.', 404)
    )
    @access.public
    def getUISpecByKey(self, key, params, **kwargs):
        key = key.lower()

        ui_list = [
            c for (a, b, c) in sorted(
                (
                    ui.get('key', k).lower(),
                    ui.get('key', k),
                    ui
                )
                for k, ui in ui_specs.items()
            )
            if a == key
        ]

        if ui_list:
            return ui_list[0]

        raise RestException('UI not found.', 404)

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

    @describeRoute(
        Description('Find UI specs that match the given parameters.')
        .param('key', 'Key of the UI', required=False)
        .param('name', 'Name of the UI', required=False)
        .param('tags', 'Tags to search for', required=False)
    )
    @access.public
    def getUISpecs(self, params, **kwargs):
        key = params.get('key', '').lower()
        name = params.get('name', '').lower()
        tags = params.get('tags', '').lower()
        tags = set(filter(bool, (x.strip() for x in tags.split(','))))

        return [
            d for (a, b, c, d, e) in sorted(
                (
                    key,
                    ui.get('name', key).lower(),
                    ui.get('name', key),
                    ui,
                    ui.get('tags', set())
                )
                for key, ui in ui_specs.items()
            )
            if (
                (not key or a == key) and
                (not name or b == name) and
                (not tags or e.intersection(tags))
            )
        ]

    @access.public
    @describeRoute(
        Description('Create a job from the given task spec')
        .notes('Each task takes a variety of input parameters.  See the '
               'appropriate task specification.')
        .param('key', 'Key of the task', paramType='path')
        .param('title', 'Title of the job', required=False)
    )
    def runTaskSpec(self, key, params, **kwargs):
        task_spec = task_specs.get(key)
        if task_spec is None:
            raise RestException('No task named %s.' % key)

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

        jobpayload = self.model('jobpayload', 'osumo').createJobpayload(
                job['_id'], user['_id'])

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
                extra_args = json.loads('{{{}}}'.format(extra_args))
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
                value = ':'.join(pos_args[1:])
                job_input['type'] = 'string'
                job_input['format'] = 'text'
                job_input['mode'] = 'inline'
                job_input['data'] = value

            elif input_type == 'BOOLEAN':
                value = pos_args[1]
                job_input['type'] = 'boolean'
                job_input['format'] = 'json'
                job_input['mode'] = 'inline'
                job_input['data'] = 'true' if int(value) else 'false'

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
                extra_args = json.loads('{{{}}}'.format(extra_args))
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

            elif output_type in (
                    'INTEGER', 'FLOAT', 'STRING', 'BOOLEAN', 'JSON'):
                parse_result = urllib.parse.urlparse(
                        getConfig()['database']['uri'])

                job_output['mode'] = 'sumo'
                job_output['db'] = parse_result.path[1:]
                job_output['collection'] = 'jobpayload'
                job_output['host'] = parse_result.netloc
                job_output['id'] = jobpayload['_id']
                job_output['key'] = output_name

                if output_type == 'INTEGER':
                    job_output['type'] = 'number'
                    job_output['format'] = 'number'
                    job_output['converter'] = 'int'

                elif output_type == 'FLOAT':
                    job_output['type'] = 'number'
                    job_output['format'] = 'number'
                    job_output['converter'] = 'float'

                elif output_type == 'STRING':
                    job_output['type'] = 'string'
                    job_output['format'] = 'text'

                elif output_type == 'BOOLEAN':
                    job_output['type'] = 'boolean'
                    job_output['format'] = 'boolean'
                    job_output['converter'] = 'bool'

                elif output_type == 'JSON':
                    job_output['type'] = 'string'
                    job_output['format'] = 'text'
                    job_output['converter'] = 'json'

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
        self.model('jobuser', 'osumo').createJobuser(job['_id'], user['_id'])
        self.model('job', 'jobs').scheduleJob(job)

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

    def dataProcess(self, event):
        """
        Called when a file is uploaded.  If it is from one of our jobs, record
        the details.

        :param event: the event with the file information.
        """
        reference = event.info['reference']
        jobuser = self.model('jobuser', 'osumo').findOne(
                {'jobId': ObjectId(reference)})

        user = self.model('user').findOne({'_id': jobuser['userId']})
        job = self.model('job', 'jobs').load(
                jobuser['jobId'], user=user, level=AccessType.ADMIN)

        self.model('jobuser', 'osumo').appendFile(
                jobuser,
                event.info['file']['_id'],
                event.info['file']['itemId'],
                event.info['file']['name'])

        self.model('job', 'jobs').updateJob(
                job,
                log='Added processed file %s' % event.info['file']['name'])


def load(info):
    # Check environment variables for anonymous user/password; bail if not set.
    anonuser = os.environ.get('OSUMO_ANON_USER')
    if not anonuser:
        try:
            with open(os.path.join(info['pluginRootDir'], 'osumo_anonlogin.txt')) as f:
                anonuser = f.read().strip()
        except IOError:
            pass

    if not anonuser:
        logprint.error('Environment variable OSUMO_ANON_USER must be set, or a file osumo_anonlogin.txt must exist.')
        raise RuntimeError

    user_model = ModelImporter.model('user')
    anon_user = user_model.findOne({
        'login': anonuser
    })

    if anon_user is None:
        anon_user = user_model.createUser(
            login=anonuser,
            password=None,
            firstName='Public',
            lastName='User',
            email='anon@example.com',
            admin=False,
            public=False)
        anon_user['status'] = 'enabled'

        anon_user = user_model.save(anon_user)

    Osumo._cp_config['tools.staticdir.dir'] = (
        os.path.join(info['pluginRootDir'], 'web_client'))
    osumo = Osumo(anonuser)
    registerPluginWebroot(osumo, info['name'])
    info['apiRoot'].osumo = osumo

    events.bind('data.process', 'osumo', osumo.dataProcess)
