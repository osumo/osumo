import { connect } from 'react-redux';

import LoginDialog from '../../dialog/login';
import actions from '../../../actions';

const LoginDialogContainer = connect(
  ({ dialog: { error, focus, form } }, { filterKey }) => {
    error = error || {};
    focus = focus || {};
    form = form || {};

    let { field: errorKey, message: errorMessage } = error;
    let { field: focusField, time: focusTime } = focus;

    return {
      errorKey,
      errorMessage,
      filterKey,
      focusField,
      focusTime,
      form
    };
  },

  (dispatch) => ({
    onClose: () => dispatch(actions.closeDialog()),
    onForgottenPassword: () => dispatch(actions.openResetPasswordDialog()),
    onRegister: () => dispatch(actions.openRegisterDialog()),
    onSubmit: () => dispatch(actions.submitLoginForm()),
    onUpdate: (data) => dispatch(actions.updateDialogForm(data))
  })
)(LoginDialog);

export default LoginDialogContainer;
