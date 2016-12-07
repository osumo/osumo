import URI from 'urijs';
import { rest, router, routeStack } from './globals';
import actions from './actions';

/* :target/a/b/c/etc... -> sets global nav target */
export const setGlobalNavTarget = ({ target }, next) => {
  actions._router_setGlobalNavTarget(target);
  next();
};

/* like above, but hardcoded for the main page */
export const setGlobalNavTargetToIndex = ({}, next) => (
  setGlobalNavTarget({ target: '' }, next)
);

/* :target/... -> checks target for special values before passing along */
export const handleDialog = ({ query }, next) => {
  let fragment = URI('?' + query);

  const fileSelect = fragment.hasQuery('dialog', 'file-select');
  const login      = fragment.hasQuery('dialog', 'login');
  const logout     = fragment.hasQuery('dialog', 'logout');
  const register   = fragment.hasQuery('dialog', 'register');
  const forgotPass = fragment.hasQuery('dialog', 'forgot-password');

  if (fileSelect) {
    actions._router_openFileSelectorDialog();
  } else if (login) {
    actions._router_openLoginDialog();
  } else if (logout) {
    rest.logout();
  } else if (register) {
    actions._router_openRegisterDialog();
  } else if (forgotPass) {
    actions._router_openResetPasswordDialog();
  } else {
    next();
  }
};

export const targetMiddleWare = [
  setGlobalNavTarget,
  handleDialog
];

export default {
  handleDialog,
  setGlobalNavTarget,
  setGlobalNavTargetToIndex,
  targetMiddleWare
};
