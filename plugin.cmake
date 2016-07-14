###############################################################################
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
###############################################################################

add_python_style_test(
  python_static_analysis_osumo
  "${CMAKE_CURRENT_LIST_DIR}/server"
)

add_python_style_test(
  python_static_analysis_osumo_tests
  "${CMAKE_CURRENT_LIST_DIR}/plugin_tests"
)

add_eslint_test(
  js_static_analysis_osumo_gruntfile
  "${CMAKE_CURRENT_LIST_DIR}/Gruntfile.js"
  ESLINT_CONFIG_FILE "${PROJECT_SOURCE_DIR}/plugins/osumo/.eslintrc"
)
add_eslint_test(
  js_static_analysis_osumo_source
  "${CMAKE_CURRENT_LIST_DIR}/web-external/src"
  ESLINT_CONFIG_FILE "${PROJECT_SOURCE_DIR}/plugins/osumo/.eslintrc"
)

add_python_test(tasks PLUGIN osumo BIND_SERVER
  EXTERNAL_DATA
  "plugins/osumo/osumotestfiles.zip"
)
set_property(TEST server_osumo.tasks
 APPEND PROPERTY ENVIRONMENT
 "OSUMO_DATA=${PROJECT_BINARY_DIR}/data/plugins/osumo"
)

