#!/usr/bin/env python
# -*- coding: utf-8 -*-

##############################################################################
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
##############################################################################

# Deal with a bug where PEP257 fails when parsing __all__.  Sadly, this
# disables flake tests for the whole file.
# flake8: noqa

import girder
import yaml

from girder.constants import TerminalColor

from .. import yaml_importer  # noqa

# This is the list of jobs we want to load.  It could be changed to search the
# local directory for .yml files
_jobList = ['kmeans', 'surv', 'iGPSe', 'iGPSePart2', 'silhouette']

# This is the list of jobs we succeeded in loading.  Other modules can use this
# list to determine which jobs are available
jobList = []

# from each job, import doc as (job)
for job in _jobList:
    try:
        _temp = __import__(job, globals(), locals(), ['doc'], -1)
        if not 'task' in _temp.doc:
            print(TerminalColor.error(
                  'ERROR: Job not specified peroperly "%s":' % job))
            girder.logger.info('Job not specified properly: %s' % job)
            continue
        globals()[job] = _temp.doc
        jobList.append(job)
    except yaml.parser.ParserError:
        print(TerminalColor.error(
              'ERROR: Failed to parse job "%s":' % job))
        girder.logger.exception('Job yaml parse error: %s' % job)
    except Exception:
        print(TerminalColor.error(
              'ERROR: Failed to load job "%s":' % job))
        girder.logger.exception('Job load failure: %s' % job)

__all__ = jobList
