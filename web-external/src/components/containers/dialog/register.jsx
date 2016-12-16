import { connect } from 'react-redux';

import RegisterDialog from '../../dialog/register';
import actions from '../../../actions';

const RegisterDialogContainer = connect(
  ({ loginInfo, dialog: { error, focus, form } }, { filterKey }) => {
    loginInfo = loginInfo || {};
    error = error || {};
    focus = focus || {};
    form = form || {};

    let { user: currentUser } = loginInfo;
    let { field: errorKey, message: errorMessage } = error;
    let { field: focusField, time: focusTime } = focus;

    return {
      currentUser,
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
    onSubmit: () => dispatch(actions.submitRegistrationForm()),
    onUpdate: (data) => dispatch(actions.updateDialogForm(data))
  })
)(RegisterDialog);

export default RegisterDialogContainer;
