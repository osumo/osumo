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


def get_task_spec(key):
    """Return the task spec for the given key."""
    task_spec_path = '.'.join((key, 'yml'))
    task_spec_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), task_spec_path)
    task_spec = yaml_loader.load(task_spec_path)
    task_spec['key'] = key.lower()

    return task_spec


def get_task_specs():
    """Return the set of task specs available."""
    file_list = iglob(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '*.yml'))
    key_list = (
        os.path.basename(os.path.splitext(file)[0])
        for file in file_list)
    return {
        key: get_task_spec(key)
        for key in key_list}
