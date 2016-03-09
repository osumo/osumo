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

export function setInMapping (state = {}, rest) {
  let entries = rest.entries;
  delete rest.entries;
  delete rest.type;

  return {
    ...state,
    ...rest,
    ...entries
  };
}

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
