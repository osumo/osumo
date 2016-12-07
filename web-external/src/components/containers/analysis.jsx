import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

import Analysis from '../body/analysis';
import actions from '../../actions';
import { rest } from '../../globals';
import objectReduce from '../../utils/object-reduce';

const AnalysisContainer = connect(
  ({ analysis: { forms, pages } }) => {
    forms = forms || {};
    const onAction = (page, action) => {
      let pageForm = forms[page.name] || {};
      let form = (
        (page.elements || [])
          .map(({ key }) => key)
          .filter((key) => !isUndefined(key))
          .map((key) => [key, (pageForm[key] || {}).value])
          .reduce(objectReduce, {})
      );
      console.log('ACTION');
      console.dir({ action, form, page });
    };

    return { forms, onAction, pages }
  },

  () => ({
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
