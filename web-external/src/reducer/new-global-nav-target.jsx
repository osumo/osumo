import ACTION_TYPES from './new-action-types';

const setGlobalNavTarget = (globalNavTarget, target) => (
  globalNavTarget === target ? globalNavTarget : target
);

const globalNavTarget = (state=null, action) => {
  const { type } = action;

  if (type === ACTION_TYPES.SET_GLOBAL_NAV_TARGET) {
    const { target } = action;
    state = setGlobalNavTarget(state, target);

  }

  return state;
};

export default globalNavTarget;
