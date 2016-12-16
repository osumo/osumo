import { connect } from 'react-redux';

import ResetPasswordDialog from '../../dialog/reset-password';
import actions from '../../../actions';

const ResetPasswordDialogContainer = connect(
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
    onLogin: () => dispatch(actions.openLoginDialog()),
    onRegister: () => dispatch(actions.openRegisterDialog()),
    onSubmit: () => dispatch(actions.submitResetPasswordForm()),
    onUpdate: (data) => dispatch(actions.updateDialogForm(data))
  })
)(ResetPasswordDialog);

export default ResetPasswordDialogContainer;
