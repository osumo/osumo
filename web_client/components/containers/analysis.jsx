import { connect } from 'react-redux';

import Analysis from '../body/analysis';
import actions from '../../actions';
import { rest } from '../../globals';
import { OSUMO_TMP_DIR_NAME } from '../../constants';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';
import loadModel from '../../utils/load-model';
import ItemModel from 'girder/models/ItemModel';

import baseAnalysisModules from '../../analysis-modules/base-listing';

/* TODO(opadron): replace this with a proper route (folder/:id/rootpath) */
const getFolderRootpath = (folder) => {
  let { baseParentId, baseParentType, parentId } = folder;

  if (parentId === baseParentId) {
    return rest({ path: `${baseParentType}/${baseParentId}` })
      .then(({ response }) => response)
      .then(({ name, login }) => [
        { type: baseParentType, object: { name, login } },
        { type: 'folder', object: { name: folder.name } }
      ]);
  }

  return rest({ path: `folder/${parentId}` })
    .then(({ response }) => response)
    .then(getFolderRootpath)
    .then((objects) => [
      ...objects,
      { type: 'folder', object: { name: folder.name } }
    ]);
};

const modules = (
  baseAnalysisModules
    .map(({ key, module }) => [key, module])
    .reduce(objectReduce, {})
);

const AnalysisContainer = connect(
  ({ analysis: { busy, currentPage, objects, pages, states } }) => {
    objects = objects || {};
    pages = pages || [];
    states = states || {};

    return {
      busy,
      currentPage,
      objects,
      pages,
      states
    };
  },

  (dispatch) => ({
    baseAnalysisModules,

    onBaseAnalysis: (key) => (
      dispatch(actions.truncateAnalysisPages(0))
        .then(() => modules[key])
        .then((mod) => (mod ? mod() : null))
    ),

    onAction: (objects, states, page, action, ...extraArgs) => (
      dispatch(actions.triggerAnalysisAction({
        action,
        extraArgs,
        objects,
        page,
        states
      }))
    ),

    onFileSelect: (element) => (
      dispatch(actions.setItemSelectedCallback((item) => {
        (
          dispatch(actions.populateFileSelectionElement(element, item))
          .then(() => dispatch(actions.closeDialog()))
        );
      }))

      .then(() => {
        let { options } = element;
        let { onlyNames, onlyDataTypes, onlyFileTypes } = (options || {});

        let filter = null;
        let onlyNameRegex, onlyDataTypeRegex, onlyFileTypeRegex;

        if (onlyNames || onlyDataTypes || onlyFileTypes) {
          if (onlyNames) {
            onlyNameRegex = new RegExp(onlyNames);
          }

          if (onlyDataTypes) {
            onlyDataTypeRegex = new RegExp(onlyDataTypes);
          }

          if (onlyFileTypes) {
            onlyFileTypeRegex = new RegExp(onlyFileTypes);
          }

          filter = (item) => {
            let result = true;
            if (item._modelType === 'item') {
              if (onlyNames && !onlyNameRegex.test(item.name)) {
                result = false;
              } else if (
                onlyDataTypes &&
                (
                  !item.meta ||
                  !onlyDataTypeRegex.test(item.meta.sumoDataType)
                )
              ) {
                result = false;
              } else if (
                onlyFileTypes &&
                (
                  !item.meta ||
                  !onlyFileTypeRegex.test(item.meta.sumoFileType)
                )
              ) {
                result = false;
              }
            } else if (item._modelType === 'folder') {
              if (item.name === OSUMO_TMP_DIR_NAME) {
                result = false;
              }
            }

            return result;
          };
        }

        return dispatch(actions.setItemFilter(filter));
      })

      .then(() => {
        let folders = (
          element.type === 'folderSelection' ||
          element.type === 'folder_selection' ||
          element.type === 'folder-selection'
        );

        return Promise.all([
          dispatch(actions.setFileNavigationFolderSelectMode(folders)),
          dispatch(actions.setFileNavigationShowItems(!folders))
        ]);
      })

      .then(() => dispatch(actions.openFileSelectorDialog()))
    ),

    onItemSave: (item, name, itemWidget) => {
      dispatch(actions.ensurePrivateDirectory({ returnModel: true }))
        .then((parent) => {
          let data = {
            folderId: parent.id,
            name
          };

          data = Object.entries(data)
            .map(([k, v]) => `${k}=${v}`)
            .join('&');

          rest({
            path: `item/${item.id}/copy?${data}`,
            type: 'POST'
          })
            .then(({ response: { _id } }) => loadModel(_id, ItemModel))
            .then((newItem) => dispatch(actions.updateAnalysisElementState(
              itemWidget, { savedItem: newItem })));
        });
    },

    onPageClick: (page) => dispatch(actions.setCurrentAnalysisPage(page)),

    onStateChange: (element, newState) => dispatch(
      actions.updateAnalysisElementState(element, newState)
    )
  })
)(Analysis);

export default AnalysisContainer;
