import {
  isArray,
  isObject,
  isUndefined
} from 'underscore';

import objectReduce from './object-reduce';

const setScalar = (state = null, { value }) => (
  (
    isArray(value) ||
      isObject(value) ||
        isUndefined(value)
  ) ? state : value
);

const appendToList = (state = [], { entry }) => {
  let { id, value } = entry;
  id = id || 0;

  return [...state, { id, value }];
};

const extendList = (state = [], { entries }) => ([
  ...state,

  ...entries.map(({ id, value }) => ({
    id: id || 0,
    value
  }))
]);

const removeFromList = (state = [], { id, ids }) => {
  ids = ids || [];
  if (!isUndefined(id)) {
    ids = [...ids, id];
  }

  let idSet = new Set(ids);
  return state.filter(({ id }) => !idSet.has(id));
};

const setInMapping = (
    state = {},
    args /* es7: { type, entries, ...rest } */
) => {
  /* must pick the attributes out in this manner to keep eslint happy */
  let { entries, ...rest } = args;
  delete rest.type;

  return {
    ...state,
    ...rest,
    ...entries
  };
};

const unsetInMapping = (state = {}, { keys, key }) => {
  keys = keys || [];
  if (!isUndefined(key)) {
    keys = [...keys, key];
  }

  if (keys.length === 0) { return state; }
  let keySet = new Set(keys);

  return (
    Object
    .entries(state)
    .filter(([key, value]) => !keySet.has(key))
    .reduce(objectReduce)
  );
};

export {
  appendToList,
  extendList,
  removeFromList,
  setInMapping,
  setScalar,
  unsetInMapping
};
