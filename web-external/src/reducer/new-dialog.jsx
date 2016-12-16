import { isNil } from 'lodash';
import ACTION_TYPES from './new-action-types';

const ensure = (x, def) => (isNil(x) ? def : x);

const clearDialogFocus = (dialog) => setDialogFocus(dialog, null);

const clearDialogForm = (dialog) => {
  dialog = { ...dialog, form: {} };
  return dialog;
};

const setDialogComponent = (dialog, key) => {
  if (dialog.componentKey !== key) {
    dialog = { ...dialog, componentKey: key };
  }

  return dialog;
};

const setDialogError = (dialog, field, message) => {
  dialog = setDialogFocus(dialog, field);

  let { error } = dialog;
  error = ensure(error, {});

  if (error.field !== field || error.message !== message) {
    error = { ...error, field, message };
    dialog = { ...dialog, error };
  }

  return dialog;
};

const setDialogFocus = (dialog, field, time) => {
  let { focus } = dialog;
  focus = ensure(focus, {});

  field = ensure(field, 'no-field');
  if (field === 'no-field') {
    field = null;
    time = null;
  } else {
    time = ensure(time, new Date());
  }

  if (focus.field !== field || focus.time !== time) {
    focus = { ...focus, field, time };
    dialog = { ...dialog, focus };
  }

  return dialog;
};

const setFileNavigationRoot = (dialog, modelType, root) => {
  let { fileNavigation } = dialog;
  fileNavigation = ensure(fileNavigation, {});

  if (
    fileNavigation.root !== root ||
    fileNavigation.modelType !== modelType
  ) {
    fileNavigation = { ...fileNavigation, root, modelType };
    dialog = { ...dialog, fileNavigation };
  }

  return dialog;
};

const updateDialogForm = (dialog, form) => {
  dialog = {
    ...dialog,
    form: {
      ...ensure(dialog.form, {}),
      ...form
    }
  };

  return dialog;
};

const dialog = (state={}, action) => {
  const { type } = action;

  if (
    type === ACTION_TYPES.CLEAR_LOGIN_INFO           ||
    type === ACTION_TYPES.CLOSE_DIALOG               ||
    type === ACTION_TYPES.OPEN_FILE_SELECTOR_DIALOG  ||
    type === ACTION_TYPES.OPEN_LOGIN_DIALOG          ||
    type === ACTION_TYPES.OPEN_RESET_PASSWORD_DIALOG ||
    type === ACTION_TYPES.OPEN_REGISTER_DIALOG       ||
    type === ACTION_TYPES.SET_LOGIN_INFO
  ) {
    state = (
      setDialogComponent(
        setDialogError(
          clearDialogForm(
            clearDialogFocus(state)
          ),
          null,
          null
        ),
        null
      )
    );
  }


  if (type === ACTION_TYPES.OPEN_FILE_SELECTOR_DIALOG) {
    state = setDialogComponent(state, 'file-select');

  } else if (type === ACTION_TYPES.OPEN_LOGIN_DIALOG) {
    state = setDialogComponent(state, 'login');

  } else if (type === ACTION_TYPES.OPEN_RESET_PASSWORD_DIALOG) {
    state = setDialogComponent(state, 'reset-password');

  } else if (type === ACTION_TYPES.OPEN_REGISTER_DIALOG) {
    state = setDialogComponent(state, 'register');

  } else if (type === ACTION_TYPES.SET_DIALOG_ERROR) {
    const { field, message } = action;
    state = setDialogError(state, field, message);

  } else if (type === ACTION_TYPES.SET_DIALOG_FOCUS) {
    const { field, time } = action;
    state = setDialogFocus(state, field, time);

  } else if (type === ACTION_TYPES.UPDATE_DIALOG_FORM) {
    const { form } = action;
    state = updateDialogForm(state, form);

  } else if (type === ACTION_TYPES.SET_FILE_NAVIGATION_ROOT) {
    const { modelType, root } = action;
    state = setFileNavigationRoot(state, modelType, root);
  }

  return state;
};

export default dialog;
