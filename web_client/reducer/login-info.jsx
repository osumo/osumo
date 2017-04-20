import { isNil } from 'lodash';
import ACTION_TYPES from './action-types';

const ensure = (x, def) => (isNil(x) ? def : x);

const setLoginInfo = (loginInfo, user, token, anonymous = false) => {
  token = ensure(token, (user ? user.token : undefined));

  if (loginInfo.user !== user ||
        loginInfo.token !== token ||
        loginInfo.anonymous !== anonymous) {
    loginInfo = { ...loginInfo, token, user, anonymous };
  }

  return loginInfo;
};

const initialState = {
  user: null,
  token: null,
  anonymous: false
};

const loginInfo = (state = initialState, action) => {
  const { type } = action;

  if (type === ACTION_TYPES.CLEAR_LOGIN_INFO) {
    state = setLoginInfo(state, null);
  } else if (type === ACTION_TYPES.SET_LOGIN_INFO) {
    const { token, user, anonymous } = action;
    state = setLoginInfo(state, user, token, anonymous);
  }

  return state;
};

export default loginInfo;
