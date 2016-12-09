import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

import Analysis from '../body/analysis';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';

const AnalysisContainer = connect(
  ({ analysis: { forms, pages } }) => ({ forms, pages }),

  () => ({
    onAction: actions.triggerAnalysisAction,

    onFileSelect: (page, formKey) => {
      actions.setItemSelectedCallback((item) => (

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
          actions.setAnalysisFormState(page.name, formKey, {
            value: item._id,
            name: item.name,
            path: `${ path }/${ item.name }`
          })
        ))

        .then(actions.closeDialog)
      ));

      actions.openFileSelectorDialog();
    },

    onStateChange: (page, formKey, newState) => {
      actions.setAnalysisFormState(page.name, formKey, newState);
    }
  })
)(Analysis);

export default AnalysisContainer;
