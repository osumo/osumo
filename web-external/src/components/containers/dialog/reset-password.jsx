import { connect } from 'react-redux';

import ResetPasswordDialog from '../../dialog/reset-password';
import actions from '../../../actions';

const ResetPasswordDialogContainer = connect(
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
  ) => ({
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
    onRegister: () => actions.openRegisterDialog(),
    onSubmit: () => actions.submitResetPasswordForm(),
    onUpdate: (data) => actions.updateDialogForm(data)
  })
)(ResetPasswordDialog);

export default ResetPasswordDialogContainer;
