import URI from 'urijs';
import { store } from './globals';
import actions from './actions';

/* :target/a/b/c/etc... -> sets global nav target */
export const setGlobalNavTarget = ({ target }, next) => (
  store.dispatch(actions.setGlobalNavTarget(target, true))
    .then(() => next())
);

/* like above, but hardcoded for the main page */
export const setGlobalNavTargetToIndex = (params, next) => (
  setGlobalNavTarget({ target: '' }, next)
);

/* :target/... -> checks target for special values before passing along */
export const handleDialog = ({ query }, next) => {
  let fragment = URI('?' + query);

  const has = (x) => fragment.hasQuery('dialog', x);

  return (
    has('file-select')
      ? store.dispatch(actions.openFileSelectorDialog(true))

      : has('login')
      ? store.dispatch(actions.openLoginDialog(true))

      : has('logout')
      ? store.dispatch(actions.submitLogoutForm())
        .then(() => store.dispatch(actions.closeDialog()))

      : has('register')
      ? store.dispatch(actions.openRegisterDialog(true))

      : has('forgot-password')
      ? store.dispatch(actions.openResetPasswordDialog(true))

      : next()
  );
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
