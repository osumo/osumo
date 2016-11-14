import { rest, router, routeStack } from './globals';
import actions from './actions';

/* :target/a/b/c/etc... -> sets global nav target */
export const setGlobalNavTarget = ({ params: { target } }, next) => {
  actions.setGlobalNavTarget(target);
  next();
};

/* like above, but hardcoded for the main page */
export const setGlobalNavTargetToIndex = (_, next) => (
  setGlobalNavTarget({ params: { target: '' } }, next)
);

/* :target/... -> checks target for special values before passing along */
export const handleSpecialNavTarget = ({ params: { target } }, next) => {
  let currentRoute = router();
  let doPush = (
    (
      target === 'file-select' ||
      target === 'login' ||
      target === 'register' ||
      target === 'forgot-password'
    ) && !(
      currentRoute === 'file-select' ||
      currentRoute === 'login' ||
      currentRoute === 'register' ||
      currentRoute === 'forgot-password'
    )
  );

  if (doPush) {
    routeStack.push(currentRoute);
  }

  if (target === 'file-select') {
    actions.openFileSelectorDialog();
  } else if (target === 'login') {
    actions.openLoginDialog();
  } else if (target === 'logout') {
    rest.logout();
  } else if (target === 'register') {
    actions.openRegisterDialog();
  } else if (target === 'forgot-password') {
    actions.openResetPasswordDialog();
  } else {
    next();
  }
};

export const targetMiddleWare = [
  handleSpecialNavTarget,
  setGlobalNavTarget
];

export default {
  setGlobalNavTarget,
  setGlobalNavTargetToIndex,
  handleSpecialNavTarget,
  targetMiddleWare
};
