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
  (D, S) => {
    D({ type: ACTION_TYPES.ADD_ANALYSIS_ELEMENT, element, parent });

    let { id } = element;
    if (isUndefined(id)) {
      let { analysis } = S();
      element = analysis.objects[analysis.idAllocator.id];
    }

    return { ...element };
  }
);

export const addAnalysisPage = (page) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.ADD_ANALYSIS_PAGE, page });

    let promise = null;
    let { id } = page;
    if (isUndefined(id)) {
      let { analysis: { lastPageId, objects, pages, states } } = S();
      page = objects[lastPageId];

      if (pages.length === 1) {
        promise = D(triggerAnalysisAction(
          { objects, states },
          page,
          'tabEnter',
          { nothrow: true }
        )).then(
          () => { ...page }
        );
      }
    }

    return promise || { ...page };
  }
);

export const addUploadFileEntries = (entries) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.ADD_UPLOAD_FILE_ENTRIES, entries });
    return [...S().upload.fileEntries];
  }
);

export const clearLoginInfo = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.CLEAR_LOGIN_INFO });

    let { loginInfo } = S();
    return { ...loginInfo };
  }
);

export const closeDialog = (byRouter = false) => promiseAction(
  (D, S) => {
    if (byRouter) {
      D({ type: ACTION_TYPES.CLOSE_DIALOG });
      return { ...S().dialog };
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

    return D(closeDialog(true));
  }
);

export const disableAnalysisPage = (page) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.DISABLE_ANALYSIS_PAGE, page });

    let { id } = page;
    if (isUndefined(id)) { id = page; }
    let { analysis } = S();
    page = analysis.objects[id];
    if (page) { page = { ...page }; }

    return page;
  }
);

export const enableAnalysisPage = (page) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.ENABLE_ANALYSIS_PAGE, page });

    let { id } = page;
    if (isUndefined(id)) { id = page; }
    let { analysis } = S();
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
  (D, S) => {
    if (byRouter) {
      D({ type: ACTION_TYPES.OPEN_FILE_SELECTOR_DIALOG });
      return { ...S().dialog };
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

    return D(openFileSelectorDialog(true));
  }
);

export const openLoginDialog = (byRouter = false) => promiseAction(
  (D, S) => {
    if (byRouter) {
      D({
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

      return { ...S().dialog };
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

    return D(openLoginDialog(true));
  }
);

export const openResetPasswordDialog = (byRouter = false) => promiseAction(
  (D, S) => {
    if (byRouter) {
      D({
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

      return { ...S().dialog };
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

    return D(openResetPasswordDialog(true));
  }
);

export const openRegisterDialog = (byRouter = false) => promiseAction(
  (D, S) => {
    if (byRouter) {
      D({
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

      return { ...S().dialog };
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

    return D(openRegisterDialog(true));
  }
);

export const registerAnalysisAction = (
  pageKey,
  actionName,
  callback
) => promiseAction(
  () => {
    globals.analysisActionTable[pageKey] = (
      globals.analysisActionTable[pageKey] || {});

    globals.analysisActionTable[pageKey][actionName] = callback;
  }
);

export const removeAnalysisElement = (element) => promiseAction(
  (D) => D({ type: ACTION_TYPES.REMOVE_ANALYSIS_ELEMENT, element })
);

export const removeAnalysisPage = (page, key) => promiseAction(
  (D) => D({ type: ACTION_TYPES.REMOVE_ANALYSIS_PAGE, key, page })
);

export const removeUploadFileEntry = (index) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.REMOVE_UPLOAD_FILE_ENTRY, index })
    return [...S().upload.fileEntries];
  }
);

export const resetUploadState = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.RESET_UPLOAD_STATE })
    return { ...S().upload };
  }
);

export const setUploadModeToDefault = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.SET_UPLOAD_MODE_DEFAULT })
    return S().upload.mode;
  }
);

export const setUploadModeToDragging = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.SET_UPLOAD_MODE_DRAGGING })
    return S().upload.mode;
  }
);

export const setUploadModeToDone = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.SET_UPLOAD_MODE_DONE })
    return S().upload.mode;
  }
);

export const setUploadModeToUploading = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.SET_UPLOAD_MODE_UPLOADING })
    return S().upload.mode;
  }
);

export const setCurrentAnalysisPage = (page, key) => promiseAction(
  (D, S) => {
    let promise = Promise.resolve();

    let { analysis: oldAnalysis } = S();
    if (!isNil(oldAnalysis.currentPage)) {
      promise = promise.then(
        () => D(triggerAnalysisAction(
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

    return promise.then(() => D({
      type: ACTION_TYPES.SET_CURRENT_ANALYSIS_PAGE, key, page
    })).then(() => {
      let { analysis: { currentPage, states, objects } } = S();
      let cPage = objects[currentPage];
      return D(triggerAnalysisAction(
        { states, objects }, cPage, 'tabEnter', { nothrow: true }
      )).then(() => cPage);
    });
  }
);

export const setCurrentUser = (user, token) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.SET_LOGIN_INFO, token, user });
    return (
      D(setFileNavigationRoot(user))
        .then(() => ({ ...S().loginInfo.user }))
    );
  }
);

export const setDialogError = (field, message) => promiseAction(
  (D, S) => {
    if (isUndefined(message)) {
      message = field;

      /* try to extract the field from the message */
      if (isString(message) && message.startsWith('Parameter \'')) {
        let match = message.match(/Parameter '([a-zA-Z0-9]+)'/);
        if (match) { field = match[1]; }
      }
    }

    D({ type: ACTION_TYPES.SET_DIALOG_ERROR, field, message });
    return { ...S().dialog.error };
  }
);

export const setFileNavigationFolderSelectMode = (mode) => promiseAction(
  (D, S) => {
    D({
      type: ACTION_TYPES.SET_FILE_NAVIGATION_FOLDER_SELECT_MODE,
      mode
    });

    return S().dialog.fileSelect.folderSelectMode;
  }
);

export const setFileNavigationShowItems = (showItems) => promiseAction(
  (D, S) => {
    D({
      type: ACTION_TYPES.SET_FILE_NAVIGATION_SHOW_ITEMS,
      showItems
    });

    return S().dialog.fileSelect.showItems;
  }
);

export const setFileNavigationRoot = (root, type) => promiseAction(
  (D, S) => {
    if (isString(root)) {
      return (
        getResourceFromId(root, type)
          .then((root) => D(setFileNavigationRoot(root)))
      );
    }

    D({
      type: ACTION_TYPES.SET_FILE_NAVIGATION_ROOT,
      modelType: root._modelType,
      root
    });

    return { ...S().dialog.fileSelect.root };
  }
);

export const setGlobalNavTarget = (target, byRouter = false) => promiseAction(
  (D, S) => {
    if (byRouter) {
      D({ type: ACTION_TYPES.SET_GLOBAL_NAV_TARGET, target });
      return S().globalNavTarget;
    }

    globals.router.navigate(
      [target, URI(globals.router()).query()]
        .filter((string) => string !== '')
        .join('?'),
      {
        trigger: false
      }
    );

    return D(setGlobalNavTarget(target, true));
  }
);

export const setItemFilter = (filter) => promiseAction(
  () => (globals.itemFilter = filter)
);

export const setItemSelectedCallback = (callback) => promiseAction(
  () => (globals.itemSelectedCallback = callback)
);

export const submitLoginForm = (form) => promiseAction(
  (D, S) => {
    if (isUndefined(form)) { ({ dialog: { form } } = S()); }
    let { login, password } = form;
    let result;
    return (
      rest
        .login(login, password)
        .then((user) => D(setCurrentUser(user, user.token.token)))
        .then((user) => (result = user))
        .then(() => D(closeDialog()))
        .then(() => result)
        .catch(
          ({ responseJSON: { message } }) => (
            D(setDialogError('login', message))
          )
        )
    );
  }
);

export const submitLogoutForm = () => promiseAction(
  (D, S) => (
    rest.logout().then(() => D(clearLoginInfo()))
      .then(() => ({ ...S().loginInfo }))
  )
);

export const submitResetPasswordForm = (form) => promiseAction(
  (D, S) => {
    if (isUndefined(form)) { ({ dialog: { form } } = S()); }
    let { email } = form;

    return (
      rest({
        path: 'user/password/temporary',
        data: { email: email.trim() },
        type: 'PUT'
      }).then(() => {
        /* TODO(opadron) */
        console.log('password reset success?');
        return D(closeDialog());
      }).catch((response) => {
        let { responseJSON: { field, message } } = response;
        return D(setDialogError(field, message));
      })
    );
  }
);

export const submitRegistrationForm = (form) => promiseAction(
  (D, S) => {
    if (isUndefined(form)) { ({ dialog: { form } } = S()); }
    let {
      login,
      email,
      firstName,
      lastName,
      password,
      password2
    } = form;

    if (password !== password2) {
      return D(setDialogError('password', 'Passwords must match.'));
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
        () => D(submitLoginForm({ login, password }))
      ).catch((response) => {
        let { responseJSON: { field, message } } = response;
        return D(setDialogError(field, message));
      })
    );
  }
);

export const toggleAnalysisPage = (page) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.TOGGLE_ANALYSIS_PAGE, page });

    let { id } = page;
    if (isUndefined(id)) { id = page; }
    let { analysis } = S();
    page = analysis.objects[id];
    if (page) { page = { ...page }; }

    return page;
  }
);

export const toggleHeaderDropdown = () => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.TOGGLE_HEADER_DROPDOWN });
    return S().header.dropdownOpened;
  }
);

export const triggerAnalysisAction = (data, page, action, options={}) => {
  let { nothrow, extraArgs: args } = options;

  nothrow = nothrow || false;
  args = args || [];

  return promiseAction(
    (D, S) => {
      let callback = globals.analysisActionTable[page.key];
      if (callback) { callback = callback[action]; }
      if (!callback) {
        if (nothrow) { return null; }
        throw new Error(
          `No such analysis action registered: ${page.key}.${action}`);
      }

      return callback.apply(
        {
          dispatch: D,
          getState: S
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
  (D, S) => {
    D({ type: ACTION_TYPES.TRUNCATE_ANALYSIS_PAGES, count, ...options });
    return S().analysis.pages;
  }
);

export const updateAnalysisElement = (element, props) => promiseAction(
  (D, S) => {
    D({
      type: ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT,
      element,
      ...props
    });

    let { id } = element;
    if (isUndefined(id)) { id = element; }

    let { analysis: { objects } } = S();
    return { ...objects[id] };
  }
);

export const updateAnalysisElementState = (element, state) => promiseAction(
  (D, S) => {
    D({
      type: ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT_STATE,
      element,
      state
    });

    let { analysis: { states } } = S();
    return { ...(states[id] || {}) };
  }
);

export const updateDialogForm = (form) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.UPDATE_DIALOG_FORM, form });
    return { ...S().dialog.form };
  }
);

export const updateUploadBrowseText = (text) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.UPDATE_UPLOAD_BROWSE_TEXT, text })
    return S().upload.browseText;
  }
);

export const updateUploadFileEntry = (index, state) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.UPDATE_UPLOAD_FILE_ENTRY, index, state })
    let result = S().upload.fileEntries[index];
    if (result) {
      result = { ...result };
    }
    return result;
  }
);

export const updateUploadProgress = (current, goal) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.UPDATE_UPLOAD_PROGRESS, current, goal })
    let { upload } = S();
    return [upload.progress, upload.progressGoal];
  }
);

export const updateUploadStatusText = (text) => promiseAction(
  (D, S) => {
    D({ type: ACTION_TYPES.UPDATE_UPLOAD_STATUS_TEXT, text })
    return S().upload.statusText;
  }
);

export const uploadFile = (file, params=null, parent=null) => promiseAction(
  (D, S) => {
    params = params || {};
    let { callbacks, ...restParams } = params;
    callbacks = callbacks || {};

    if (isNil(parent)) {
      let currentUser = S().loginInfo.user;
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
        (parentModel) => D(uploadFile(file, params, parentModel))
      );
    }

    if (isString(parent)) {
      return (
        getModelFromId(parent)
          .then((p) => D(uploadFile(file, params, p)))
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
  (D) => (
    rest({ path: 'token/current' })
      .then(({ response: currentToken }) => (
        currentToken
          ? rest({ path: 'user/me' }).then(
              ({ response: user }) => D(setCurrentUser(user, currentToken._id))
          )

          : D(clearLoginInfo())
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

