import { connect } from 'react-redux';

import ResetPasswordDialog from '../../dialog/reset-password';
import actions from '../../../actions';
import { router } from '../../../globals';

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
    onLogin: () => router('login'),
    onRegister: () => router('register'),
    onSubmit: () => actions.submitResetPasswordForm(),
    onUpdate: (data) => actions.updateDialogForm(data)
  })
)(ResetPasswordDialog);

export default ResetPasswordDialogContainer;
