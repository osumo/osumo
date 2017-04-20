import { isNil } from 'lodash';
import ACTION_TYPES from './action-types';

import modes from '../components/body/upload/mode-constants';

const defaultState = {
  browseText: null,
  fileEntries: [],
  mode: modes.DEFAULT,
  progress: 0,
  progressGoal: 0,
  statusText: null,
  subtitle: 'Upload local data to SUMO',
  title: 'Upload Data',
  validationFailedMessage: null
};

const resetUploadState = (state = defaultState) => {
  return defaultState;
};

const updateUploadStatusText = (state = defaultState, statusText) => {
  let { statusText: oldStatusText } = state;
  if (oldStatusText !== statusText) {
    state = {
      ...state,
      statusText
    };
  }

  return state;
};

const updateUploadBrowseText = (state = defaultState, browseText) => {
  let { browseText: oldBrowseText } = state;
  if (oldBrowseText !== browseText) {
    state = {
      ...state,
      browseText
    };
  }

  return state;
};

const updateUploadProgress = (state = defaultState, current, goal) => {
  let { progress, progressGoal } = state;

  if (progress !== current) {
    state = {
      ...state,
      progress: current
    };
  }

  if (!isNil(goal) && progressGoal !== goal) {
    state = {
      ...state,
      progressGoal: goal
    };
  }

  return state;
};

const setUploadMode = (state = defaultState, mode) => {
  let { mode: oldMode } = state;

  if (
    (
      mode === modes.DEFAULT ||
      mode === modes.FILE_DRAGGING ||
      mode === modes.UPLOAD_DONE ||
      mode === modes.UPLOADING
    ) && (
      oldMode !== mode
    )
  ) {
    state = {
      ...state,
      mode
    };
  }

  return state;
};

const addUploadFileEntries = (state = defaultState, entries) => {
  let newFiles = new Array(entries.length);
  for (let i = 0; i < entries.length; ++i) {
    let { name, size, type } = entries[i];
    newFiles[i] = {
      handle: entries[i],
      metaType: null,
      name,
      size,
      type,
      uploaded: 0
    };
  }

  if (newFiles.length) {
    state = {
      ...state,
      fileEntries: state.fileEntries.concat(newFiles)
    };
  }

  return setUploadMode(state, modes.DEFAULT);
};

const updateUploadFileEntry = (state = defaultState, index, newState) => {
  state = {
    ...state,
    fileEntries: state.fileEntries.map((entry, i) => (
      i === index
        ? { ...entry, ...newState }
        : entry
    ))
  };

  return state;
};

const removeUploadFileEntry = (state = defaultState, index) => {
  state = {
    ...state,
    fileEntries: state.fileEntries.filter((entry, i) => (i !== index))
  };

  return state;
};

const analysis = (state = defaultState, action) => {
  const { type } = action;
  if (type === ACTION_TYPES.ADD_UPLOAD_FILE_ENTRIES) {
    const { entries } = action;
    state = addUploadFileEntries(state, entries);
  } else if (type === ACTION_TYPES.REMOVE_UPLOAD_FILE_ENTRY) {
    const { index } = action;
    state = removeUploadFileEntry(state, index);
  } else if (type === ACTION_TYPES.RESET_UPLOAD_STATE) {
    state = resetUploadState(state);
  } else if (type === ACTION_TYPES.SET_UPLOAD_MODE_DEFAULT) {
    state = setUploadMode(state, modes.DEFAULT);
  } else if (type === ACTION_TYPES.SET_UPLOAD_MODE_DRAGGING) {
    state = setUploadMode(state, modes.FILE_DRAGGING);
  } else if (type === ACTION_TYPES.SET_UPLOAD_MODE_UPLOADING) {
    state = setUploadMode(state, modes.UPLOADING);
  } else if (type === ACTION_TYPES.SET_UPLOAD_MODE_DONE) {
    state = setUploadMode(state, modes.UPLOAD_DONE);
  } else if (type === ACTION_TYPES.UPDATE_UPLOAD_BROWSE_TEXT) {
    let { text } = action;
    state = updateUploadBrowseText(state, text);
  } else if (type === ACTION_TYPES.UPDATE_UPLOAD_FILE_ENTRY) {
    let { index, state: newState } = action;
    state = updateUploadFileEntry(state, index, newState);
  } else if (type === ACTION_TYPES.UPDATE_UPLOAD_PROGRESS) {
    let { current, goal } = action;
    state = updateUploadProgress(state, current, goal);
  } else if (type === ACTION_TYPES.UPDATE_UPLOAD_STATUS_TEXT) {
    let { text } = action;
    state = updateUploadStatusText(state, text);
  }

  return state;
};

export default analysis;
