
import copy
import inspect
import os
import tempfile

from girder import events
from girder.api import access
from girder.api.describe import Description, describeRoute
from girder.api.rest import Resource
from girder.constants import AccessType
from girder.utility.model_importer import ModelImporter

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
            if type in ('file', 'item', 'folder'):
                value = self._getResource(type, value, user)
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
            elif type in ('enum', 'string', 'text'):
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
            if data[key].get('type') in ('file', 'item', 'folder'):
                spec = workerUtils.girderInputSpec(
                    spec['data'], resourceType=data[key]['type'],
                    token=self.getCurrentToken(),
                    dataType=data[key].get('dataType', 'string'),
                    dataFormat=data[key].get('dataFormat', 'text'),
                    )
            inputs[key] = spec

        # TODO(opadron): make a special-purpose token just for this job in case
        # the user logs out before it finishes.
        outputs = {}
        for output in task.get('outputs', {}):
            key = output['key']
            spec = {'token': self.getCurrentToken()}
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

        return self.model('job', 'jobs').filter(job, user)

    def dataProcess(self, event):
        """
        Called when a file is uploaded.  If it is from one of our jobs, record
        the details.

        :param event: the event with the file information.
        """
        if self.jobInfo.get(event.info['reference']) is None:
            # Not our job
            return
        self.jobInfo[event.info['reference']].setdefault('processedFiles', [])
        self.jobInfo[event.info['reference']]['processedFiles'].append({
            'fileId': event.info['file']['_id'],
            'itemId': event.info['file']['itemId'],
            'name': event.info['file']['name']
        })

    def modelJobSave(self, event):
        """
        Just before a job is saved, see if it is one of ours.  If so, add our
        processedFiles information.

        :param event: the event with the job.
        """
        job = event.info
        jobId = str(job.get('_id', ''))
        if jobId not in self.jobInfo:
            # Not our job
            return
        if 'processedFiles' not in self.jobInfo[jobId]:
            # No files
            return
        # Get the list of distinct files
        files = (job.get('processedFiles', []) +
                 self.jobInfo[jobId]['processedFiles'])
        job['processedFiles'] = files
        del self.jobInfo[jobId]['processedFiles']


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
    events.bind('model.job.save', 'osumo', info['apiRoot'].osumo.modelJobSave)
