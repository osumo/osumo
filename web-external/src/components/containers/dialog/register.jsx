import { connect } from 'react-redux';

import RegisterDialog from '../../dialog/register';
import actions from '../../../actions';

const RegisterDialogContainer = connect(
  (
    {
      loginInfo: { user: currentUser },
      dialog: {
        errorMessage,
        errorField: errorKey,
        focus: { field: focusField, time: focusTime },
        form
      }
    },
    { filterKey }
  ) => ({
    currentUser,
    errorKey,
    errorMessage,
    filterKey,
    focusField,
    focusTime,
    form
  }),

  () => ({
    onClose: () => actions.closeDialog(),
    onLogin: () => actions.openLoginDialog(),
    onSubmit: () => actions.submitRegistrationForm(),
    onUpdate: (data) => actions.updateDialogForm(data)
  })
)(RegisterDialog);

export default RegisterDialogContainer;
