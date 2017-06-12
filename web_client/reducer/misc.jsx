import ACTION_TYPES from './action-types';

const defaultState = {
  tabKey: 'log'
};

const setTabKey = (state = defaultState, tabKey) => {
  let { tabKey: oldTabKey } = state;
  let changed = (tabKey !== oldTabKey);
  if (changed) {
    state = {
      ...state,
      tabKey
    };
  }
  return state;
};

const misc = (state = defaultState, action) => {
  const { type } = action;
  if (type === ACTION_TYPES.SET_MISC_TAB_KEY) {
    const { key } = action;
    state = setTabKey(state, key);
    /*
  } else if (type === ACTION_TYPES.REMOVE_UPLOAD_FILE_ENTRY) {
    const { index } = action;
    state = removeUploadFileEntry(state, index);
    */
  }

  return state;
};

export default misc;
