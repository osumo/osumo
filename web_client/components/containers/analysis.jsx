import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

import Analysis from '../body/analysis';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';
import { Promise } from '../../utils/promise';

const assemblePages = (pages, objects, visitedSet={}) => (
  pages
    .map((page) => {
      if (!visitedSet[page]) {
        visitedSet[page] = { ...objects[page] };
        visitedSet[page].elements = assemblePages(
          visitedSet[page].elements || [],
          objects,
          visitedSet
        );
      }

      return visitedSet[page];
    })
);

/* TODO(opadron): replace this with a proper route (folder/:id/rootpath) */
const getFolderRootpath = (folder) => {
  let { baseParentId, baseParentType, parentId } = folder;

  if (parentId === baseParentId) {
    return rest({ path: `${ baseParentType }/${ baseParentId }` })
      .then(({ response }) => response)
      .then(({ name, login }) => [
        { type: baseParentType, object: { name, login } },
        { type: 'folder', object: { name: folder.name } },
      ]);

  }

  return rest({ path: `folder/${ parentId }` })
    .then(({ response }) => response)
    .then(getFolderRootpath)
    .then((objects) => [
      ...objects,
      { type: 'folder', object: { name: folder.name } }
    ]);
};

const AnalysisContainer = connect(
  ({ analysis: { forms, objects, pages } }) => {
    forms = forms || {};
    objects = objects || {};
    pages = pages || [];

    return {
      forms,
      pages: assemblePages(pages, objects)
    };
  },

  (dispatch) => ({
    onAction: (...args) => dispatch(actions.triggerAnalysisAction(...args)),

    onFileSelect: (element) => (
      dispatch(actions.setItemSelectedCallback((item) => {
        let { _modelType: type } = item;

        let pathPromise;
        let name, id;

        name = item.name
        id = item._id;

        if (type === 'item') {
          pathPromise = rest({ path: `item/${ id }/rootpath` })
            .then(({ response }) => [
              ...response, { type: 'item', object: { name } }
            ])

        } else if (type === 'folder') {
          pathPromise = getFolderRootpath(item);
        } else {
          if (type === 'user') {
            name = item.login;
          }
          pathPromise = Promise.resolve([
            { type, object: { name: item.name, login: item.login } }
          ]);
        }

        return (
          pathPromise
            .map(({ type, object: { name, login } }) => (
              type === 'user' ? `/users/${ login }`
              : type === 'collection' ? `/collections/${ name }`
              : `/${ name }`
            ))

            .reduce((a, b) => a + b, '')

            .then((path) => (
              dispatch(actions.updateAnalysisElementState(
                element, {
                  value: id,
                  name,
                  path: `${ path }`,
                  type
                }
              ))
            ))

            .then(() => dispatch(actions.closeDialog()))
        );
      }))

      .then(() => {
        let { options } = element;
        let { onlyNames } = (options || {});

        let filter = null;
        let regex;

        if (onlyNames) {
          regex = new RegExp(onlyNames);
          filter = (item) => (
            item._modelType !== 'item' || regex.test(item.name)
          );
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

    onStateChange: (element, newState) => dispatch(
      actions.updateAnalysisElementState(element, newState)
    )
  })
)(Analysis);

export default AnalysisContainer;
