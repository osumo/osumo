import { connect } from 'react-redux';

import LoginDialog from '../../dialog/login';
import actions from '../../../actions';

const LoginDialogContainer = connect(
  (
    {
      dialog: {
        errorMessage,
        errorField: errorKey,
        focus: { field: focusField, time: focusTime },
        form
      }
    },
    { filterKey }
  ) => ({ errorKey, errorMessage, filterKey, focusField, focusTime, form }),

  () => ({
    onClose: () => actions.closeDialog(),
    onForgottenPassword: () => actions.openResetPasswordDialog(),
    onRegister: () => action.openRegisterDialog(),
    onSubmit: () => actions.submitLoginForm(),
    onUpdate: (data) => actions.updateDialogForm(data)
  })
)(LoginDialog);

export default LoginDialogContainer;
