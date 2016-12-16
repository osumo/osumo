import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

import Analysis from '../body/analysis';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';

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
      dispatch(actions.setItemSelectedCallback((item) => (

        rest({
          path: `item/${ item._id }/rootpath`
        })

        .then(({ response }) => response)

        .map(({ type, object: { name, login } }) => (
          type === 'user' ? `/users/${ login }`
          : type === 'collection' ? `/collections/${ name }`
          : `/${ name }`
        ))

        .reduce((a, b) => a + b)

        .then((path) => (
          dispatch(actions.updateAnalysisElementState(
            element, {
              value: item._id,
              name: item.name,
              path: `${ path }/${ item.name }`
            }
          ))
        ))

        .then(() => dispatch(actions.closeDialog()))
      )))

      .then(() => dispatch(actions.openFileSelectorDialog()))
    ),

    onStateChange: (element, newState) => dispatch(
      actions.updateAnalysisElementState(element, newState)
    )
  })
)(Analysis);

export default AnalysisContainer;
