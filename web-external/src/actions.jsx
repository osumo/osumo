import { isNull, isString, isUndefined } from 'underscore';
import globals from './globals';

let { actionTypes, rest, router, routeStack, store } = globals;
const dispatch = store.dispatch.bind(store);

export const clearCurrentUser = () => [
  { type: actionTypes.loginInfo.token.clear },
  { type: actionTypes.loginInfo.user.clear }
].forEach(dispatch);

export const clearDialog = () => [
  { type: actionTypes.header.dropdownOpened.clear },
  { type: actionTypes.dialog.componentKey.clear },
  { type: actionTypes.dialog.form.clearAll }
].forEach(dispatch);

export const closeDialog = () => {
  clearDialog();
  router(routeStack.pop());
};

export const onItemSelect = (...args) => {
  if (globals.itemSelectedCallback) {
    return globals.itemSelectedCallback(...args);
  }
}

export const openFileSelectorDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'file-selector' },
].forEach(dispatch);

export const openLoginDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'login' },
  { type: actionTypes.dialog.focus.field.set, value: 'login' },
  { type: actionTypes.dialog.focus.time.set, value: new Date() }
].forEach(dispatch);

export const openResetPasswordDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'reset-password' },
  { type: actionTypes.dialog.focus.field.set, value: 'email' },
  { type: actionTypes.dialog.focus.time.set, value: new Date() }
].forEach(dispatch);

export const openRegisterDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'register' },
  { type: actionTypes.dialog.focus.field.set, value: 'login' },
  { type: actionTypes.dialog.focus.time.set, value: new Date() }
].forEach(dispatch);

export const setCurrentUser = (user, token) => {
  [
    { type: actionTypes.loginInfo.user.set, value: user },
    { type: actionTypes.loginInfo.token.set, value: token }
  ].forEach(dispatch);

  return setFileNavigation('user', user._id);
};

export const setDialogError = ({ field, message }) => {
  if (isNull(field) || isUndefined(field)) {
    /* try to extract the field from the message */
    if (isString(message) && message.startsWith('Parameter \'')) {
      let match = message.match(/Parameter '([a-zA-Z0-9]+)'/);
      if (match) {
        field = match[1];
      }
    }
  }
  dispatch({ type: actionTypes.dialog.errorField.set, value: field });
  dispatch({ type: actionTypes.dialog.errorMessage.set, value: message });
  dispatch({ type: actionTypes.dialog.focus.field.set, value: field });
  dispatch({ type: actionTypes.dialog.focus.time.set, value: new Date() });
};

export const setFileNavigation = (parentType, parentId) => (
  (
    rest({
      path: `${ parentType }/${ parentId }`
    }).then(({ response: parent }) => ({
      parentType,
      folder: parent
    }))
  ).then(({ parentType, folder }) => dispatch({
    type: actionTypes.dialog.fileNavigation.set,
    value: { folder, parentType }
  }))
);

export const setGlobalNavTarget = (target) => {
  dispatch({ type: actionTypes.globalNavTarget.set, value: target });
  clearDialog();
};

export const setItemSelectedCallback = (callback) => (
  globals.itemSelectedCallback = callback
);

export const submitLoginForm = (state = null) => {
  if (isNull(state)) {
    state = store.getState().dialog.form;
  }

  let { login, password } = state;

  return (
    rest.login(login, password)
    .then((user) => {
      let promise = setCurrentUser(user, user.token.token);
      closeDialog();

      return promise;
    })
    .catch(({ responseJSON: { message } }) => setDialogError({
      field: 'login',
      message
    }))
  );
};

export const submitLogoutForm = () => rest.logout().then(clearCurrentUser);

export const submitResetPasswordForm = () => {
  let {
    dialog: { form: { email } }
  } = store.getState();

  return (
    rest({
      path: 'user/password/temporary',
      data: { email: email.trim() },
      type: 'PUT'
    }).then(() => {
      /* TODO(opadron) */
      console.log('password reset success?');
      closeDialog();
    }).catch((response) => {
      let { responseJSON: { field, message } } = response;
      setDialogError({ field, message });
    })
  );
};

export const submitRegistrationForm = () => {
  let {
    dialog: {
      form: {
        login,
        email,
        firstName,
        lastName,
        password,
        password2
      }
    }
  } = store.getState();

  if (password !== password2) {
    setDialogError({
      field: 'password',
      message: 'Passwords must match.'
    });
  } else {
    return (
      rest({
        path: 'user',
        type: 'POST',
        data: {
          email,
          firstName,
          lastName,
          login,
          password
        }
      }).then(
        () => submitLoginForm({ login, password })
      ).catch((response) => {
        let { responseJSON: { field, message } } = response;
        setDialogError({ field, message });
      })
    );
  }
};

export const toggleHeaderDropdown = () => dispatch({
  type: actionTypes.header.dropdownOpened.toggle
});

export const updateDialogForm = ({ key, value }) => dispatch({
  type: actionTypes.dialog.form.set,
  entries: { [key]: value }
});

export const verifyCurrentUser = () => {
  (
    rest({ path: 'token/current' })
  ).then(({ response: currentToken }) => {
    if (!currentToken) {
      return { token: null, user: null };
    }

    let token = currentToken._id;
    return (
      rest({ path: 'user/me' })
    ).then(
      ({ response: user }) => ({ token, user })
    );
  }).then(
    ({ token, user }) => setCurrentUser(user, token)
  );
};

export default {
  clearCurrentUser,
  clearDialog,
  closeDialog,
  onItemSelect,
  openFileSelectorDialog,
  openLoginDialog,
  openResetPasswordDialog,
  openRegisterDialog,
  setCurrentUser,
  setDialogError,
  setFileNavigation,
  setGlobalNavTarget,
  setItemSelectedCallback,
  submitLoginForm,
  submitLogoutForm,
  submitResetPasswordForm,
  submitRegistrationForm,
  toggleHeaderDropdown,
  updateDialogForm,
  verifyCurrentUser
};
