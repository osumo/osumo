import { connect } from 'react-redux';
import { isNil } from 'lodash';

import Analysis from '../body/analysis';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';

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
  ({ analysis: { currentPage, objects, pages, states } }) => {
    objects = objects || {};
    pages = pages || [];
    states = states || {};

    return {
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
        let { onlyNames, onlyTypes } = (options || {});

        let filter = null;
        let onlyNameRegex, onlyTypeRegex;

        if (onlyNames || onlyTypes) {
          if (onlyNames) {
            onlyNameRegex = new RegExp(onlyNames);
          }

          if (onlyTypes) {
            onlyTypeRegex = new RegExp(onlyTypes);
          }

          filter = (item) => {
            let result = true;
            if (item._modelType === 'item') {
              if (onlyNames && !onlyNameRegex.test(item.name)) {
                result = false;
              } else if (
                onlyTypes &&
                (
                  !item.meta ||
                  !onlyTypeRegex.test(item.meta.sumoDataType)
                )
              ) {
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

    onPageClick: (page) => dispatch(actions.setCurrentAnalysisPage(page)),

    onStateChange: (element, newState) => dispatch(
      actions.updateAnalysisElementState(element, newState)
    )
  })
)(Analysis);

export default AnalysisContainer;
