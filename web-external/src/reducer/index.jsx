
import { combineReducers } from 'redux';
import ACTION_TYPES from './action-types';

import analysis from './analysis';
import dialog from './dialog';
import globalNavTarget from './global-nav-target';
import header from './header';
import loginInfo from './login-info';

const rootReducer = combineReducers({
  analysis,
  dialog,
  globalNavTarget,
  header,
  loginInfo
});

const wrappedReducer = (state, action) => {
  const { type } = action;
  if (type === ACTION_TYPES.DISPATCH_COMPOUND_ACTION) {
    (action.actions || []).forEach(
      (act) => (state = wrappedReducer(state, act))
    )
  } else {
    state = rootReducer(state, action);
  }

  return state;
};

export default wrappedReducer;

