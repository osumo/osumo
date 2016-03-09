import {
  isArray,
  isObject,
  isUndefined
} from 'underscore';

import objectReduce from './object-reduce';

export const setScalar = (state = null, { value }) => (
  (
    isArray(value) ||
      isObject(value) ||
        isUndefined(value)
  ) ? state : value
);

export const appendToList = (state = [], { entry }) => {
  let { id, value } = entry;
  id = id || 0;

  return [...state, { id, value }];
};

export const extendList = (state = [], { entries }) => ([
  ...state,

  ...entries.map(({ id, value }) => ({
    id: id || 0,
    value
  }))
]);

export const removeFromList = (state = [], { id, ids }) => {
  ids = ids || [];
  if (!isUndefined(id)) {
    ids = [...ids, id];
  }

  let idSet = new Set(ids);
  return state.filter(({ id }) => !idSet.has(id));
};

// TODO(opadron): the parser dislikes the "...rest" parameter within the object
// here. Is this correct? It may simply be a bug in the parser (e.g.,
// https://github.com/eslint/eslint/issues/4102) in which case we should figure
// out what to do about the persistent but incorrect warning.
export const setInMapping = (state={}, { type, entries, ...rest }) => ({
  ...state,
  ...rest,
  ...entries
});

export const unsetInMapping = (state = {}, { keys, key }) => {
  keys = keys || [];
  if (!isUndefined(key)) {
    keys = [...keys, key];
  }

  if (keys.length === 0) { return state; }

  let keySet = newSet(keys);

  return (
    Object
    .entries(state)
    .filter(([key, value]) => !keySet.has(key))
    .reduce(objectReduce)
  );
};
