
/*
import { compose } from '../utils/reducer';
import { bool, object, string } from '../utils/common-reducers';
import dialog from './dialog';
import analysis from './analysis';

const rootReducer = compose().children({
  analysis,
  dialog,
  globalNavTarget: string,
  header: compose().children({
    dropdownOpened: bool
  }),
  loginInfo: compose().children({
    token: string,
    user: object
  })
});

export default rootReducer;
*/

import { combineReducers } from 'redux';
import ACTION_TYPES from './new-action-types';

import analysis from './new-analysis';
import dialog from './new-dialog';
import globalNavTarget from './new-global-nav-target';
import header from './new-header';
import loginInfo from './new-login-info';

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

