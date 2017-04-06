import { isNil, isString, isUndefined } from 'lodash'; import URI from 'urijs';

import globals from './globals';
import { Promise } from './utils/promise';
import ACTION_TYPES from './reducer/action-types';

import FileModel from 'girder/models/FileModel';
import UserModel from 'girder/models/UserModel';
import CollectionModel from 'girder/models/CollectionModel';
import FolderModel from 'girder/models/FolderModel';
import AccessControlledModel from 'girder/models/AccessControlledModel';

let { rest } = globals;

const getResourceFromId = (id, type=null) => {
  let promise;
  (
    (
      isString(type) ? [ type ] : [ 'user', 'collection', 'folder' ]
    )
      .forEach((modelType) => {
        let query = { path: `${modelType}/${id}` };
        const p = () => (
          rest(query).then(({ response }) => response)
        );
        promise = (promise ? promise.catch(p) : p());
      })
  );
  return promise;
};

const getModelFromResource = (obj) => {
  const { _modelType: t } = obj;
  const Model = (
    t === 'user'
      ? UserModel
      : t === 'collection'
        ? CollectionModel
        : t === 'folder'
          ? FolderModel
          : AccessControlledModel
  );

  return new Promise((resolve, reject) => {
    let result = new Model({ _id: obj._id });
    let req = result.fetch();
    req.error((payload) => {
      let e = new Error();
      e.payload = payload;
      reject(e);
    });
    req.then(() => { resolve(result); });
  });
};


const getModelFromId = (id, type=null) => {
  return (
    getResourceFromId(id, type)
      .then(getModelFromResource)
  );
};

const promiseAction = (callback) => (dispatch, getState) => new Promise(
  (resolve, reject) => {
    try {
      let result = callback(dispatch, getState);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  }
);

export const addAnalysisElement = (element, parent) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.ADD_ANALYSIS_ELEMENT, element, parent });

    let { id } = element;
    if (isUndefined(id)) {
      let { analysis } = getState();
      element = analysis.objects[analysis.idAllocator.id];
    }

    return { ...element };
  }
);

export const addAnalysisPage = (page) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.ADD_ANALYSIS_PAGE, page });

    let promise = null;
    let { id } = page;
    if (isUndefined(id)) {
      let { analysis: { lastPageId, objects, pages, states } } = getState();
      page = objects[lastPageId];

      if (pages.length === 1) {
        promise = dispatch(triggerAnalysisAction(
          { objects, states },
          page,
          'tabEnter',
          { nothrow: true }
        )).then(
          () => ({ ...page })
        );
      }
    }

    return promise || { ...page };
  }
);

export const addUploadFileEntries = (entries) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.ADD_UPLOAD_FILE_ENTRIES, entries });
    return [...getState().upload.fileEntries];
  }
);

export const loginAnonymousUser = () => promiseAction(
  // TODO: abstract these out of the code entirely.
  (dispatch, getState) => rest.anonLogin()
    .then(({ response: user }) => dispatch(setCurrentUser(user.user, user.authToken.token, true)))
);

export const clearLoginInfo = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.CLEAR_LOGIN_INFO });

    let { loginInfo } = getState();
    return { ...loginInfo };
  }
);

export const closeDialog = (byRouter = false) => promiseAction(
  (dispatch, getState) => {
    if (byRouter) {
      dispatch({ type: ACTION_TYPES.CLOSE_DIALOG });
      return { ...getState().dialog };
    }

    let currentRoute = globals.router();
    let newRoute = (
      URI(currentRoute)
        .removeQuery('dialog')
        .toString()
    );

    globals.router.navigate(
      newRoute,
      {
        replace: true,
        trigger: false
      }
    );

    return dispatch(closeDialog(true));
  }
);

export const disableAnalysisPage = (page) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.DISABLE_ANALYSIS_PAGE, page });

    let { id } = page;
    if (isUndefined(id)) {
      id = page;
    }
    let { analysis } = getState();
    page = analysis.objects[id];
    if (page) {
      page = { ...page };
    }

    return page;
  }
);

export const enableAnalysisPage = (page) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.ENABLE_ANALYSIS_PAGE, page });

    let { id } = page;
    if (isUndefined(id)) { id = page; }
    let { analysis } = getState();
    page = analysis.objects[id];
    if (page) { page = { ...page }; }

    return page;
  }
);

export const onItemSelect = (...args) => promiseAction(
  () => {
    if (globals.itemSelectedCallback) {
      return globals.itemSelectedCallback(...args);
    }
  }
);

export const openFileSelectorDialog = (byRouter = false) => promiseAction(
  (dispatch, getState) => {
    if (byRouter) {
      dispatch({ type: ACTION_TYPES.OPEN_FILE_SELECTOR_DIALOG });
      return { ...getState().dialog };
    }

    let currentRoute = globals.router();
    globals.router.navigate(
      (
        URI(currentRoute)
          .removeQuery('dialog')
          .addQuery({ dialog: 'file-select' })
          .toString()
      ),
      {
        replace: true,
        trigger: false
      }
    );

    return dispatch(openFileSelectorDialog(true));
  }
);

export const openLoginDialog = (byRouter = false) => promiseAction(
  (dispatch, getState) => {
    if (byRouter) {
      dispatch({
        type: ACTION_TYPES.DISPATCH_COMPOUND_ACTION,
        actions: [
          { type: ACTION_TYPES.OPEN_LOGIN_DIALOG },
          {
            type: ACTION_TYPES.SET_DIALOG_FOCUS,
            field: 'login',
            time: new Date()
          }
        ]
      });

      return { ...getState().dialog };
    }

    let currentRoute = globals.router();
    globals.router.navigate(
      (
        URI(currentRoute)
          .removeQuery('dialog')
          .addQuery({ dialog: 'login' })
          .toString()
      ),
      {
        replace: true,
        trigger: false
      }
    );

    return dispatch(openLoginDialog(true));
  }
);

export const openResetPasswordDialog = (byRouter = false) => promiseAction(
  (dispatch, getState) => {
    if (byRouter) {
      dispatch({
        type: ACTION_TYPES.DISPATCH_COMPOUND_ACTION,
        actions: [
          { type: ACTION_TYPES.OPEN_RESET_PASSWORD_DIALOG },
          {
            type: ACTION_TYPES.SET_DIALOG_FOCUS,
            field: 'email',
            time: new Date()
          }
        ]
      });

      return { ...getState().dialog };
    }

    let currentRoute = globals.router();
    globals.router.navigate(
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

    return dispatch(openResetPasswordDialog(true));
  }
);

export const openRegisterDialog = (byRouter = false) => promiseAction(
  (dispatch, getState) => {
    if (byRouter) {
      dispatch({
        type: ACTION_TYPES.DISPATCH_COMPOUND_ACTION,
        actions: [
          { type: ACTION_TYPES.OPEN_REGISTER_DIALOG },
          {
            type: ACTION_TYPES.SET_DIALOG_FOCUS,
            field: 'register',
            time: new Date()
          }
        ]
      });

      return { ...getState().dialog };
    }

    let currentRoute = globals.router();
    globals.router.navigate(
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

    return dispatch(openRegisterDialog(true));
  }
);

export const registerAnalysisAction = (
  pageKey,
  actionName,
  callback
) => promiseAction(
  () => {
    if (!isString(pageKey) && pageKey && isString(pageKey.key)) {
      pageKey = pageKey.key;
    }

    globals.analysisActionTable[pageKey] = (
      globals.analysisActionTable[pageKey] || {});

    globals.analysisActionTable[pageKey][actionName] = callback;
  }
);

export const removeAnalysisElement = (element) => promiseAction(
  (dispatch) => dispatch({
    type: ACTION_TYPES.REMOVE_ANALYSIS_ELEMENT,
    element
  })
);

export const removeAnalysisPage = (page, key) => promiseAction(
  (dispatch) => dispatch({
    type: ACTION_TYPES.REMOVE_ANALYSIS_PAGE,
    key,
    page
  })
);

export const removeUploadFileEntry = (index) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.REMOVE_UPLOAD_FILE_ENTRY, index })
    return [...getState().upload.fileEntries];
  }
);

export const resetUploadState = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.RESET_UPLOAD_STATE })
    return { ...getState().upload };
  }
);

export const setUploadModeToDefault = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.SET_UPLOAD_MODE_DEFAULT })
    return getState().upload.mode;
  }
);

export const setUploadModeToDragging = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.SET_UPLOAD_MODE_DRAGGING })
    return getState().upload.mode;
  }
);

export const setUploadModeToDone = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.SET_UPLOAD_MODE_DONE })
    return getState().upload.mode;
  }
);

export const setUploadModeToUploading = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.SET_UPLOAD_MODE_UPLOADING })
    return getState().upload.mode;
  }
);

export const setCurrentAnalysisPage = (page, key) => promiseAction(
  (dispatch, getState) => {
    let promise = Promise.resolve();

    let { analysis: oldAnalysis } = getState();
    if (!isNil(oldAnalysis.currentPage)) {
      promise = promise.then(
        () => dispatch(triggerAnalysisAction(
          {
            states: oldAnalysis.states || {},
            objects: oldAnalysis.objects
          },
          oldAnalysis.objects[oldAnalysis.currentPage],
          'tabExit',
          { nothrow: true }
        ))
      );
    }

    return promise.then(() => dispatch({
      type: ACTION_TYPES.SET_CURRENT_ANALYSIS_PAGE, key, page
    })).then(() => {
      let { analysis: { currentPage, states, objects } } = getState();
      let cPage = objects[currentPage];
      return dispatch(triggerAnalysisAction(
        { states, objects }, cPage, 'tabEnter', { nothrow: true }
      )).then(() => cPage);
    });
  }
);

export const setCurrentUser = (user, token, anonymous=false) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.SET_LOGIN_INFO, token, user, anonymous });
    return (
      dispatch(setFileNavigationRoot(user))
        .then(() => ({ ...getState().loginInfo.user }))
    );
  }
);

export const setDialogError = (field, message) => promiseAction(
  (dispatch, getState) => {
    if (isUndefined(message)) {
      message = field;

      /* try to extract the field from the message */
      if (isString(message) && message.startsWith('Parameter \'')) {
        let match = message.match(/Parameter '([a-zA-Z0-9]+)'/);
        if (match) { field = match[1]; }
      }
    }

    dispatch({ type: ACTION_TYPES.SET_DIALOG_ERROR, field, message });
    return { ...getState().dialog.error };
  }
);

export const setFileNavigationFolderSelectMode = (mode) => promiseAction(
  (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.SET_FILE_NAVIGATION_FOLDER_SELECT_MODE,
      mode
    });

    return getState().dialog.fileSelect.folderSelectMode;
  }
);

export const setFileNavigationShowItems = (showItems) => promiseAction(
  (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.SET_FILE_NAVIGATION_SHOW_ITEMS,
      showItems
    });

    return getState().dialog.fileSelect.showItems;
  }
);

export const setFileNavigationRoot = (root, type) => promiseAction(
  (dispatch, getState) => {
    if (isString(root)) {
      return (
        getResourceFromId(root, type)
          .then((root) => dispatch(setFileNavigationRoot(root)))
      );
    }

    dispatch({
      type: ACTION_TYPES.SET_FILE_NAVIGATION_ROOT,
      modelType: root._modelType,
      root
    });

    return { ...getState().dialog.fileSelect.root };
  }
);

export const setGlobalNavTarget = (target, byRouter = false) => promiseAction(
  (dispatch, getState) => {
    if (byRouter) {
      dispatch({ type: ACTION_TYPES.SET_GLOBAL_NAV_TARGET, target });
      return getState().globalNavTarget;
    }

    globals.router.navigate(
      [target, URI(globals.router()).query()]
        .filter((string) => string !== '')
        .join('?'),
      {
        trigger: false
      }
    );

    return dispatch(setGlobalNavTarget(target, true));
  }
);

export const setItemFilter = (filter) => promiseAction(
  () => (globals.itemFilter = filter)
);

export const setItemSelectedCallback = (callback) => promiseAction(
  () => (globals.itemSelectedCallback = callback)
);

export const submitLoginForm = (form) => promiseAction(
  (dispatch, getState) => {
    if (isUndefined(form)) { ({ dialog: { form } } = getState()); }
    let { login, password } = form;
    let result;
    return (
      rest
        .logout()
        .then(() => rest.login(login, password))
        .catch(({ responseJSON: { message }}) => (
          dispatch(setDialogError('login', message))
            .then(() => dispatch(loginAnonymousUser()))
            .then(() => Promise.reject(new Error(message)))
        ))
        .then((user) => dispatch(setCurrentUser(user, user.token.token)))
        .then((user) => (result = user))
        .then(() => dispatch(closeDialog()))
        .then(() => result)
    );
  }
);

export const submitLogoutForm = () => promiseAction(
  (dispatch, getState) => (
    rest.logout().then(() => dispatch(loginAnonymousUser()))
      .then(() => ({ ...getState().loginInfo }))
  )
);

export const submitResetPasswordForm = (form) => promiseAction(
  (dispatch, getState) => {
    if (isUndefined(form)) { ({ dialog: { form } } = getState()); }
    let { email } = form;

    return (
      rest({
        path: 'user/password/temporary',
        data: { email: email.trim() },
        type: 'PUT'
      }).then(() => {
        /* TODO(opadron) */
        console.log('password reset success?');
        return dispatch(closeDialog());
      }).catch((response) => {
        let { responseJSON: { field, message } } = response;
        return dispatch(setDialogError(field, message));
      })
    );
  }
);

export const submitRegistrationForm = (form) => promiseAction(
  (dispatch, getState) => {
    if (isUndefined(form)) { ({ dialog: { form } } = getState()); }
    let {
      login,
      email,
      firstName,
      lastName,
      password,
      password2
    } = form;

    if (password !== password2) {
      return dispatch(setDialogError('password', 'Passwords must match.'));
    }

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
        () => dispatch(submitLoginForm({ login, password }))
      ).catch((response) => {
        let { responseJSON: { field, message } } = response;
        return dispatch(setDialogError(field, message));
      })
    );
  }
);

export const toggleAnalysisPage = (page) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_ANALYSIS_PAGE, page });

    let { id } = page;
    if (isUndefined(id)) { id = page; }
    let { analysis } = getState();
    page = analysis.objects[id];
    if (page) { page = { ...page }; }

    return page;
  }
);

export const toggleHeaderDropdown = () => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_HEADER_DROPDOWN });
    return getState().header.dropdownOpened;
  }
);

export const triggerAnalysisAction = (data, page, action, options={}) => {
  let { nothrow, extraArgs: args } = options;

  nothrow = nothrow || false;
  args = args || [];

  return promiseAction(
    (dispatch, getState) => {
      let callback = globals.analysisActionTable[page.key];
      if (callback) { callback = callback[action]; }
      if (!callback) {
        if (nothrow) {
          return null;
        }
        throw new Error(
          `No such analysis action registered: ${page.key}.${action}`);
      }

      return callback.apply(
        {
          dispatch,
          getState,
        }, /* this */
        [
          data,
          page,
          action,
          ...args
        ] /* args */
      );
    }
  );
};

export const truncateAnalysisPages = (count, options={}) => promiseAction(
  (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.TRUNCATE_ANALYSIS_PAGES,
      count,
      ...options
    });
    return getState().analysis.pages;
  }
);

export const updateAnalysisElement = (element, props) => promiseAction(
  (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT,
      element,
      ...props
    });

    let { id } = element;
    if (isUndefined(id)) { id = element; }

    let { analysis: { objects } } = getState();
    return { ...(objects[id] || {}) };
  }
);

export const updateAnalysisElementState = (element, state) => promiseAction(
  (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT_STATE,
      element,
      state
    });

    let { id } = element;
    if (isUndefined(id)) { id = element; }

    let { analysis: { states } } = getState();
    return { ...(states[id] || {}) };
  }
);

export const updateDialogForm = (form) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.UPDATE_DIALOG_FORM, form });
    return { ...getState().dialog.form };
  }
);

export const updateUploadBrowseText = (text) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.UPDATE_UPLOAD_BROWSE_TEXT, text })
    return getState().upload.browseText;
  }
);

export const updateUploadFileEntry = (index, state) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.UPDATE_UPLOAD_FILE_ENTRY, index, state })
    let result = getState().upload.fileEntries[index];
    if (result) {
      result = { ...result };
    }
    return result;
  }
);

export const updateUploadProgress = (current, goal) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.UPDATE_UPLOAD_PROGRESS, current, goal })
    let { upload } = getState();
    return [upload.progress, upload.progressGoal];
  }
);

export const updateUploadStatusText = (text) => promiseAction(
  (dispatch, getState) => {
    dispatch({ type: ACTION_TYPES.UPDATE_UPLOAD_STATUS_TEXT, text })
    return getState().upload.statusText;
  }
);

export const uploadFile = (file, params=null, parent=null) => promiseAction(
  (dispatch, getState) => {
    params = params || {};
    let { callbacks, ...restParams } = params;
    callbacks = callbacks || {};

    if (isNil(parent)) {
      let currentUser = getState().loginInfo.user;
      return rest({
        path: 'folder',
        data: {
          parentType: 'user',
          parentId: currentUser._id,
          limit: 1,
          offset: 0,
          sort: 'lowerName',
          sordir: 1
        }
      }).then(({ response: parentList }) => getModelFromResource(
        parentList.length > 0
          ? parentList[0]
          : currentUser
      )).then(
        (parentModel) => dispatch(uploadFile(file, params, parentModel))
      );
    }

    if (isString(parent)) {
      return (
        getModelFromId(parent)
          .then((p) => dispatch(uploadFile(file, params, p)))
      );
    }

    return new Promise((resolve, reject) => {
      let fileModel = new FileModel();

      if (!isNil(callbacks.onChunk)) {
        fileModel.on('g:upload.chunkSent', callbacks.onChunk);
      }

      if (!isNil(callbacks.onProgress)) {
        fileModel.on('g:upload.progress', callbacks.onProgress);
      }

      fileModel.on('g:upload.complete', () => {
        resolve({ file: fileModel, parent: parent });
      });

      fileModel.on('g:upload.error', (info) => {
        let e = new Error('Upload Error');
        e.info = info;
        e.type = 'upload'
        reject(e);
      });

      fileModel.on('g:upload.errorStarting', (info) => {
        let e = new Error('Upload Start Error');
        e.info = info;
        e.type = 'uploadStart'
        reject(e);
      });

      fileModel.upload(parent, file, null, restParams);
    });
  }
);

export const verifyCurrentUser = () => promiseAction(
  (dispatch) => (
    rest({ path: 'token/current' })
      .then(({ response: currentToken }) => (
        currentToken
          ? rest({ path: 'osumo/user/me' }).then(
              ({ response: user }) => (
                dispatch(setCurrentUser(user, currentToken._id, user.anonymous))
              )
          )

          : dispatch(loginAnonymousUser())
      ))
  )
);

export default {
  addAnalysisElement,
  addAnalysisPage,
  addUploadFileEntries,
  clearLoginInfo,
  closeDialog,
  disableAnalysisPage,
  enableAnalysisPage,
  loginAnonymousUser,
  onItemSelect,
  openFileSelectorDialog,
  openLoginDialog,
  openResetPasswordDialog,
  openRegisterDialog,
  setCurrentAnalysisPage,
  registerAnalysisAction,
  removeAnalysisElement,
  removeAnalysisPage,
  removeUploadFileEntry,
  resetUploadState,
  updateAnalysisElementState,
  setCurrentUser,
  setDialogError,
  setFileNavigationRoot,
  setFileNavigationFolderSelectMode,
  setFileNavigationShowItems,
  setGlobalNavTarget,
  setItemSelectedCallback,
  setItemFilter,
  setUploadModeToDefault,
  setUploadModeToDragging,
  setUploadModeToDone,
  setUploadModeToUploading,
  submitLoginForm,
  submitLogoutForm,
  submitResetPasswordForm,
  submitRegistrationForm,
  toggleAnalysisPage,
  toggleHeaderDropdown,
  triggerAnalysisAction,
  truncateAnalysisPages,
  updateAnalysisElement,
  updateAnalysisElementState,
  updateDialogForm,
  updateUploadBrowseText,
  updateUploadFileEntry,
  updateUploadProgress,
  updateUploadStatusText,
  uploadFile,
  verifyCurrentUser
};

