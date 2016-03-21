
import copy
import os.path
import tempfile

from girder import events
from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource
from girder.constants import AccessType

from girder.plugins.worker import utils as workerUtils

from . import yaml_importer  # noqa
from . import job_specs


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
        self.jobUsers = {}

    @describeRoute(
        Description('List available tasks')
    )
    @access.public
    def getTasks(self, *args, **kwargs):
        tasks = []
        for job in job_specs.jobList:
            task = getattr(job_specs, job).copy()
            if 'task' in task:
                del task['task']
                task['key'] = job
                tasks.append((
                    task.get('name', job).lower(),
                    task.get('name', job),
                    task
                ))
        tasks.sort()
        tasks = [taskrow[-1] for taskrow in tasks]
        return tasks

    @access.user
    @describeRoute(
        Description('Process a task')
        .notes('Each task takes a variety of input parameters.  See the '
               'appropriate task specification.')
        .param('taskkey', 'Key specifying the task to process.', required=True)
    )
    def processTask(self, params, **kwargs):
        self.requireParams(('taskkey', ), params)
        task = copy.deepcopy(getattr(job_specs, params['taskkey']))
        data = {}
        data.update({input['key']: input for input in task['inputs']})
        data.update({input['key']: input for input in task['parameters']})
        # Any input that doesn't have a default is required.
        self.requireParams((key for key in data
                            if 'default' not in data[key]), params)

        user = self.getCurrentUser()

        for key in data:
            value = params.get(key, data[key].get('default', None))

            type = data[key].get('type')
            if type in ('item', 'folder'):
                value = self.model(type).load(value, user=user)
            elif type == 'integer':
                value = int(value)
            elif type == 'boolean':
                value = 'true' if value in (True, 'true') else 'false'
            elif type == 'temppath':
                file = tempfile.NamedTemporaryFile(
                    suffix=value if value is not None else '')
                value = file.name
                file.close()
                data[key]['format'] = 'text'
                data[key]['type'] = 'string'
            else:
                raise NotImplementedError('No input data type %s' % type)
            data[key]['data'] = value

        job = self.model('job', 'jobs').createJob(
            title='sumo %s' % task.get('name', 'task'),
            type='sumo',
            user=user,
            handler='worker_handler')

        jobToken = self.model('job', 'jobs').createJobToken(job)

        job['kwargs']['jobInfo'] = workerUtils.jobInfoSpec(
            job=job,
            token=jobToken,
            logPrint=True)

        inputs = {}
        for key in data:
            if data[key].get('input') is False:
                continue
            spec = data.get(key, {}).copy()
            if data[key].get('type') in ('item', 'folder'):
                spec = workerUtils.girderInputSpec(
                    spec['data'], resourceType=data[key]['type'],
                    token=self.getCurrentToken())
            inputs[key] = spec

        # TODO(opadron): make a special-purpose token just for this job in case
        # the user logs out before it finishes.
        outputs = {}
        for output in task.get('outputs', {}):
            key = output['key']
            spec = {'token': self.getCurrentToken()}
            for subkey in output:
                if subkey != 'key':
                    value = output[subkey]
                    if value.startswith('parameter:'):
                        valuekey = value.split(':', 1)[1]
                        value = data.get(valuekey, {}).get('data')
                    spec[subkey] = value
            outputs[key] = workerUtils.girderOutputSpec(**spec)

        job['kwargs'].update(task=task['task'], inputs=inputs, outputs=outputs)

        job = self.model('job', 'jobs').save(job)
        self.model('job', 'jobs').scheduleJob(job)
        self.jobUsers[str(job['_id'])] = user

        return self.model('job', 'jobs').filter(job, user)

    def processJob(self, event):
        """
        Called when a file is uploaded.
        """
        if self.jobUsers.get(event.info['reference']) is None:
            # Not our job
            return
        jobsModel = self.model('job', 'jobs')
        jobsModel.exposeFields(level=AccessType.READ, fields=('processedFiles'))
        job = jobsModel.load(
            event.info['reference'], level=AccessType.WRITE,
            user=self.jobUsers.get(event.info['reference']), exc=True)
        if 'processedFiles' not in job:
            job['processedFiles'] = []
        job['processedFiles'].append({
            'fileId': event.info['file']['_id'],
            'itemId': event.info['file']['itemId'],
            'name': event.info['file']['name']
        })
        jobsModel.save(job)


def load(info):
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

    events.bind('data.process', 'osumo', info['apiRoot'].osumo.processJob)
