import { isNull, isString, isUndefined } from 'lodash';
import URI from 'urijs';
import globals from './globals';

let { actionTypes, rest, store } = globals;

const dispatch = store.dispatch.bind(store);

export const _router_closeDialog = () => [
  { type: actionTypes.header.dropdownOpened.clear },
  { type: actionTypes.dialog.componentKey.clear },
  { type: actionTypes.dialog.form.clearAll }
].forEach(dispatch);

export const _router_openFileSelectorDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'file-selector' },
].forEach(dispatch);

export const _router_openLoginDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'login' },
  { type: actionTypes.dialog.focus.field.set, value: 'login' },
  { type: actionTypes.dialog.focus.time.set, value: new Date() }
].forEach(dispatch);

export const _router_openResetPasswordDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'reset-password' },
  { type: actionTypes.dialog.focus.field.set, value: 'email' },
  { type: actionTypes.dialog.focus.time.set, value: new Date() }
].forEach(dispatch);

export const _router_openRegisterDialog = () => [
  { type: actionTypes.dialog.errorField.clear },
  { type: actionTypes.dialog.errorMessage.clear },
  { type: actionTypes.dialog.form.clearAll },
  { type: actionTypes.dialog.componentKey.set, value: 'register' },
  { type: actionTypes.dialog.focus.field.set, value: 'login' },
  { type: actionTypes.dialog.focus.time.set, value: new Date() }
].forEach(dispatch);

export const _router_setGlobalNavTarget = (target) => dispatch({
  type: actionTypes.globalNavTarget.set,
  value: target
});

export const addAnalysisElement = (element, pageId) => dispatch({
  type: actionTypes.analysis.addElement, element, pageId
});

export const addAnalysisPage = (page) => dispatch({
  type: actionTypes.analysis.addPage, page
});

export const clearCurrentUser = () => [
  { type: actionTypes.loginInfo.token.clear },
  { type: actionTypes.loginInfo.user.clear }
].forEach(dispatch);

export const closeDialog = () => {
  let currentRoute = router();
  let newRoute = (
    URI(currentRoute)
      .removeQuery('dialog')
      .toString()
  );

  router.navigate(
    (
      URI(currentRoute)
        .removeQuery('dialog')
        .toString()
    ),
    {
      replace: true
    }
  );
  _router_closeDialog();
};

export const onItemSelect = (...args) => {
  if (globals.itemSelectedCallback) {
    return globals.itemSelectedCallback(...args);
  }
};

export const openFileSelectorDialog = () => {
  let currentRoute = router();
  router.navigate(
    (
      URI(currentRoute)
        .removeQuery('dialog')
        .addQuery({ dialog: 'file-select' })
        .toString()
    ),
    {
      replace: true
    }
  );
};

export const openLoginDialog = () => {
  let currentRoute = router();
  router.navigate(
    (
      URI(currentRoute)
        .removeQuery('dialog')
        .addQuery({ dialog: 'login' })
        .toString()
    ),
    {
      replace: true
    }
  );
};

export const openResetPasswordDialog = () => {
  let currentRoute = router();
  router.navigate(
    (
      URI(currentRoute)
        .removeQuery('dialog')
        .addQuery({ dialog: 'forgot-password' })
        .toString()
    ),
    {
      replace: true
    }
  );
};

export const openRegisterDialog = () => {
  let currentRoute = router();
  router.navigate(
    (
      URI(currentRoute)
        .removeQuery('dialog')
        .addQuery({ dialog: 'register' })
        .toString()
    ),
    {
      replace: true
    }
  );
};

export const registerAnalysisAction = (pageName, actionName, callback) => {
  globals.analysisActionTable[pageName] = (
    globals.analysisActionTable[pageName] || {});

  globals.analysisActionTable[pageName][actionName] = callback;
};

export const removeAnalysisElement = (id, pageId) => dispatch({
  type: actionTypes.analysis.removeElement, pageId, id
});

export const removeAnalysisPage = (options) => dispatch({
  type: actionTypes.analysis.removePage, ...options
});

export const setAnalysisFormState = (name, key, state) => (
  dispatch({
    type: actionTypes.analysis.setFormState,
    name,
    key,
    state
  })
);

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

export const setGlobalNavTarget = (target) => router.navigate(
  [target, URI(router()).query()]
    .filter((string) => string !== '')
    .join('?')
);

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

export const triggerAnalysisAction = (forms, page, action, ...args) => {
  let callback = globals.analysisActionTable[page.name];
  if (callback) { callback = callback[action]; }
  if (!callback) {
    throw new Error(
      `No such analysis action registered: ${ page.name }.${ action }`);
  }

  return callback(forms, page, action, ...args);
};

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
  _router_closeDialog,
  _router_openFileSelectorDialog,
  _router_openLoginDialog,
  _router_openRegisterDialog,
  _router_openResetPasswordDialog,
  _router_setGlobalNavTarget,
  addAnalysisElement,
  addAnalysisPage,
  clearCurrentUser,
  closeDialog,
  onItemSelect,
  openFileSelectorDialog,
  openLoginDialog,
  openResetPasswordDialog,
  openRegisterDialog,
  registerAnalysisAction,
  removeAnalysisElement,
  removeAnalysisPage,
  setAnalysisFormState,
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
  triggerAnalysisAction,
  updateDialogForm,
  verifyCurrentUser
};
