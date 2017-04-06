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

"""Task specifications for OSUMO jobs."""

import os.path

from glob import iglob
from .. import yaml_loader

task_specs = {  # dictionary

    # key
    os.path.splitext(os.path.basename(spec_path))[0]:
        # value
        yaml_loader.load(spec_path)

    # current_file_location/*.yml
    for spec_path in iglob(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '*.yml'))
}

for key in task_specs:
    task_specs[key]['key'] = key.lower()