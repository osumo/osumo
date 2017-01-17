import { isNil } from 'lodash';
import ACTION_TYPES from './action-types';

const ensure = (x, def) => (isNil(x) ? def : x);

const setLoginInfo = (loginInfo, user, token) => {
  token = ensure(token, (user ? user.token : undefined));

  if (loginInfo.user !== user || loginInfo.token !== token) {
    loginInfo = { ...loginInfo, token, user };
  }

  return loginInfo;
};

const loginInfo = (state={}, action) => {
  const { type } = action;

  if (type === ACTION_TYPES.CLEAR_LOGIN_INFO) {
    state = setLoginInfo(state, null);

  } else if (type === ACTION_TYPES.SET_LOGIN_INFO) {
    const { token, user } = action;
    state = setLoginInfo(state, user, token);
  }

  return state;
};

export default loginInfo;
