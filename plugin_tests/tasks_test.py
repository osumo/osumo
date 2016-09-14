#!/usr/bin/env python
# -*- coding: utf-8 -*-

#############################################################################
#  Copyright Kitware Inc.
#
#  Licensed under the Apache License, Version 2.0 ( the "License" );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#############################################################################

import json
import os
import requests
import time
import zipfile

import girder
from girder import config
from tests import base

# boiler plate to start and stop the server

os.environ['GIRDER_PORT'] = os.environ.get('GIRDER_TEST_PORT', '20200')
config.loadConfig()  # Must reload config to pickup correct port


def setUpModule():
    base.enabledPlugins.append('osumo')
    base.startServer(False)


def tearDownModule():
    base.stopServer()


class OsumoTasksTest(base.TestCase):
    def setUp(self):
        base.TestCase.setUp(self)
        admin = {
            'email': 'admin@email.com',
            'login': 'adminlogin',
            'firstName': 'Admin',
            'lastName': 'Last',
            'password': 'adminpassword',
            'admin': True
        }
        self.admin = self.model('user').createUser(**admin)
        # Configure girder woker
        resp = self.request(
            '/system/setting', method='PUT', user=self.admin, params={
                'list': json.dumps([{
                    'key': 'worker.broker',
                    'value': 'amqp://guest@127.0.0.1/'
                    }, {
                    'key': 'worker.backend',
                    'value': 'amqp://guest@127.0.0.1/'
                    }])})
        self.assertStatusOk(resp)
        # Create OSUMO user and folders
        osumouser = {
            'email': 'osumo@email.com',
            'login': 'osumopublicuser',
            'firstName': 'OSUMO',
            'lastName': 'Public',
            'password': 'osumopassword',
            'admin': False
        }
        self.osumouser = self.model('user').createUser(**osumouser)
        folders = self.model('folder').childFolders(
            self.osumouser, 'user', user=self.admin)
        for folder in folders:
            if folder['name'] == 'Public':
                self.publicFolder = folder
        self.inputFolder = self.model('folder').createFolder(
            self.publicFolder, 'Osumo Inputs',
            parentType='folder', creator=self.osumouser)
        self.outputFolder = self.model('folder').createFolder(
            self.publicFolder, 'Osumo Results',
            parentType='folder', creator=self.osumouser)
        self.JobStatus = girder.plugins.jobs.constants.JobStatus

    def _uploadFile(self, folder, path, zippath=None):
        """
        Upload the specified path to the specified folder and return the
        resulting item.

        :param folder: folder to upload to.
        :param path: path to upload.  This may be a zip file.
        :param zippath: if not None, path refers to a zip file and this is the
                        path within the zip file.
        :returns: file: the created file.
        """
        if zippath:
            name = os.path.basename(zippath)
            with zipfile.ZipFile(path) as zip:
                with zip.open(zippath) as file:
                    data = file.read()
        else:
            name = os.path.basename(path)
            with open(path, 'rb') as file:
                data = file.read()
        resp = self.request(
            path='/file', method='POST', user=self.admin, params={
                'parentType': 'folder',
                'parentId': folder['_id'],
                'name': name,
                'size': len(data)
            })
        self.assertStatusOk(resp)
        uploadId = resp.json['_id']

        fields = [('offset', 0), ('uploadId', uploadId)]
        files = [('chunk', name, data)]
        resp = self.multipartRequest(
            path='/file/chunk', fields=fields, files=files, user=self.admin)
        self.assertStatusOk(resp)
        self.assertIn('itemId', resp.json)
        return resp.json

    def _uploadTestFiles(self, filelist=None):
        """
        From our test archive, upload our known files and return references to
        them all.

        :returns: a dictionary of file names, each with item id and file id.
        """
        if filelist is None:
            filelist = ['brca.rdata', 'Medium.csv', 'miRNA.sample.csv',
                        'mRNA.sample.csv', 'sil_miRNA_Exp.csv', 'Small.csv',
                        'time.cencer.csv']
        files = {}
        for filename in filelist:
            file = self._uploadFile(self.inputFolder, os.path.join(
                os.environ['OSUMO_DATA'], 'osumotestfiles.zip'), os.path.join(
                'TestFiles', filename))
            files[filename] = {
                'fileId': str(file['_id']),
                'itemId': str(file['itemId']),
            }
        return files

    def _processTask(self, params, result=None, timeout=30):
        """
        Run an OSUMO task until it ends.

        :param params: parameter to pass to POST /osumo
        :param result: expected result
        :param timeout: the maximum time we expect the job to take in seconds.
            Be generous.
        :returns: the job object upon completion.
        """
        if result is None:
            result = self.JobStatus.SUCCESS
        # We have to send the POST via actual http request rather than the
        # normal simulated request to cherrypy.  This is required because
        # cherrypy needs to know how it was reached so that girder_worker can
        # reach it when done.
        headers = [('Accept', 'application/json')]
        self._buildHeaders(headers, None, None, None, None, None)
        headers = {header[0]: header[1] for header in headers}
        req = requests.post('http://127.0.0.1:%d/api/v1/osumo' % (
            int(os.environ['GIRDER_PORT']), ), headers=headers, data=params)
        self.assertEqual(req.status_code, 200)
        job = req.json()
        self.assertIn('job', job)
        jobId = str(job['job']['_id'])
        jobToken = str(job['token'])
        starttime = time.time()
        while time.time() - starttime < timeout:
            resp = self.request(path='/job/' + jobId,
                                params={'token': jobToken})
            self.assertStatusOk(resp)
            job = resp.json
            # Ensure that there is something in the job log if we had an error,
            # as that gets flushed after the status change
            if ((job.get('log') and job['status'] in (
                    girder.plugins.jobs.constants.JobStatus.ERROR, )) or
                    job['status'] in (
                        girder.plugins.jobs.constants.JobStatus.CANCELED,
                        girder.plugins.jobs.constants.JobStatus.SUCCESS)):
                self.assertEqual(job['status'], result)
                return job
            time.sleep(0.05)
        self.assertFalse('Job processing timed out')

    def _getJobFiles(self, job):
        """
        For each processedFile in a job, add its name as a key to a dictionary
        with the file information.

        :param job: a job which might have files.
        :returns: a dictionary with file names as keys.  Each value contains a
            fileId, itemId, and name (which is the same as the key).
        """
        jobFiles = {}
        for file in job.get('processedFiles', []):
            key = file['name']
            jobFiles[key] = file
        return jobFiles

    def testTaskListAndBadParameters(self):
        files = self._uploadTestFiles(['Small.csv'])
        self.assertIn('Small.csv', files)
        # Get our list of tasks
        resp = self.request(path='/osumo/tasks')
        self.assertStatusOk(resp)
        # We have at least five tasks
        self.assertGreaterEqual(len(resp.json), 5)

        # Test the endpoint with bad parameters
        resp = self.request(path='/osumo', method='POST')
        self.assertStatus(resp, 400)
        self.assertIn('Parameter \'taskkey\' is required.',
                      resp.json['message'])

        params = {
            'taskkey': 'not_a_task',
        }
        resp = self.request(path='/osumo', method='POST', params=params)
        self.assertStatus(resp, 400)
        self.assertIn('No task named', resp.json['message'])

    def testTaskKMeans(self):
        files = self._uploadTestFiles(['Small.csv', 'Medium.csv'])
        # Test kmeans with correct parameters
        params = {
            'taskkey': 'kmeans',
            'targetFolderId': str(self.outputFolder['_id']),
            'input_path': files['Small.csv']['itemId'],
            'has_header': 'true',
            'num_clusters': 5,
        }
        job = self._processTask(params)
        self.assertIn('processedFiles', job)
        jobFiles = self._getJobFiles(job)
        self.assertEqual(len(jobFiles), 2)
        self.assertIsNotNone(jobFiles.get('centers.csv'))
        resp = self.request(
            path='/file/%s/download' % jobFiles['centers.csv']['fileId'],
            isJson=False)
        results = self.getBody(resp, text=False)
        self.assertEqual(len(results.split('\n')), 6)
        self.assertEqual(results.split('\n')[0], '"a","b"')

        # Test with a larger dataset
        params = {
            'taskkey': 'kmeans',
            'targetFolderId': str(self.outputFolder['_id']),
            'input_path': files['Medium.csv']['itemId'],
            'has_header': 'true',
            'num_clusters': 25,
        }
        job = self._processTask(params)
        self.assertIn('processedFiles', job)
        jobFiles = self._getJobFiles(job)
        self.assertEqual(len(jobFiles), 2)
        self.assertIsNotNone(jobFiles.get('centers.csv'))
        resp = self.request(
            path='/file/%s/download' % jobFiles['centers.csv']['fileId'],
            isJson=False)
        results = self.getBody(resp, text=False)
        self.assertEqual(len(results.split('\n')), 26)

        # Test with a bad parameter
        params = {
            'taskkey': 'kmeans',
            'targetFolderId': str(self.outputFolder['_id']),
            'input_path': files['Small.csv']['itemId'],
            'has_header': 'true',
            'num_clusters': 0,
        }
        job = self._processTask(params, self.JobStatus.ERROR)
        self.assertIn('Error: number of cluster centres', ''.join(job['log']))

    def testTaskSurvival(self):
        files = self._uploadTestFiles(['brca.rdata'])
        # Test surv with correct parameters
        params = {
            'taskkey': 'surv',
            'targetFolderId': str(self.outputFolder['_id']),
            'input_rdata': files['brca.rdata']['itemId'],
            'num_clusters': 5,
        }
        job = self._processTask(params)
        self.assertIn('processedFiles', job)
        jobFiles = self._getJobFiles(job)
        self.assertEqual(len(jobFiles), 3)
        plot = jobFiles.get('Survival Plot.png')
        self.assertIsNotNone(plot)
        resp = self.request(path='/file/%s/download' % plot['fileId'],
                            isJson=False)
        results = self.getBody(resp, text=False)
        self.assertEqual(results[:4], '\x89PNG')

        # Test with bad parameters
        params['num_clusters'] = 0
        job = self._processTask(params, self.JobStatus.ERROR)
        self.assertIn('Error: number of cluster centres', ''.join(job['log']))

        params['num_clusters'] = 1
        job = self._processTask(params, self.JobStatus.ERROR)
        self.assertIn('Error in survdiff.fit', ''.join(job['log']))

    def testTaskIgpse(self):
        files = self._uploadTestFiles([
            'miRNA.sample.csv', 'mRNA.sample.csv', 'time.cencer.csv'])
        # Test iGPSe with correct parameters
        params = {
            'taskkey': 'iGPSe',
            'targetFolderId': str(self.outputFolder['_id']),
            'mrna_input_path': files['mRNA.sample.csv']['itemId'],
            'mrna_clusters': 4,
            'mirna_input_path': files['miRNA.sample.csv']['itemId'],
            'mirna_clusters': 3,
            'clinical_input_path': files['time.cencer.csv']['itemId'],
        }
        job = self._processTask(params)
        self.assertIn('processedFiles', job)
        jobFiles = self._getJobFiles(job)
        self.assertEqual(len(jobFiles), 7)
        heatmapa = jobFiles.get('mRNA Heatmap.png')
        heatmapb = jobFiles.get('miRNA Heatmap.png')
        clusters = jobFiles.get('clusters.json')
        self.assertIsNotNone(heatmapa)
        self.assertIsNotNone(heatmapb)
        self.assertIsNotNone(clusters)
        resp = self.request(path='/file/%s/download' % heatmapa['fileId'],
                            isJson=False)
        results = self.getBody(resp, text=False)
        self.assertEqual(results[:4], '\x89PNG')
        resp = self.request(path='/file/%s/download' % heatmapb['fileId'],
                            isJson=False)
        results = self.getBody(resp, text=False)
        self.assertEqual(results[:4], '\x89PNG')

        params2 = {
            'taskkey': 'iGPSePart2',
            'targetFolderId': str(self.outputFolder['_id']),
            'transferData': jobFiles['transferData.txt']['fileId'],
            'groups': json.dumps({
                'group_f': 2,
                'GROUP': {'group1': [1, 2], 'group2': [3, 4]},
                'GROUP1': {
                    'node': [],
                    'link': [[{'source': 3, 'target': 2}]]
                },
                'GROUP2': {
                    'node': [],
                    'link': [[{'source': 1, 'target': 3}]]
                }
            }),
        }
        job = self._processTask(params2)
        self.assertIn('processedFiles', job)
        jobFiles = self._getJobFiles(job)
        self.assertEqual(len(jobFiles), 1)
        plot = jobFiles.get('Survival Plot.png')
        self.assertIsNotNone(plot)
        resp = self.request(path='/file/%s/download' % plot['fileId'],
                            isJson=False)
        results = self.getBody(resp, text=False)
        self.assertEqual(results[:4], '\x89PNG')
