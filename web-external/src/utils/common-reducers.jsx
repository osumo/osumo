import {
  isArray,
  isFunction,
  isNull,
  isObject,
  isUndefined
} from 'underscore';
import { compose } from './reducer';
import objectReduce from './object-reduce';

/* scalars */
const scalar = (filter = null, mapper = null, actions = null) => {
  const set = (state = null, action) => (
    (isFunction(filter) && !filter(action))
    ? state
    : isFunction(mapper)
      ? mapper(action ? action.value : null)
      : (action ? action.value : null)
  );

  const clear = (state, {}) => set(state, { value: null });

  if (isFunction(actions)) {
    actions = actions({ clear, set });
  }

  if (!actions) { actions = {}; }

  return compose({ set, clear, ...actions });
};

const isScalar = ({ value }) => !(
  isArray(value) ||
  isObject(value) ||
  isFunction(value)
);

const makeString = (value) => (isNull(value) ? value : String(value));
const makeNumber = (value) => Number(value);
const makeBool = (value) => Boolean(value);

const object = scalar();
const string = scalar(isScalar, makeString).defaultState(null);
const number = scalar(isScalar, makeNumber).defaultState(0);
const bool = scalar(isScalar, makeBool, ({ set }) => ({
  toggle: (state = false, {}) => set({}, { value: !state })
})).defaultState(false);

/* arrays */
const appendToArray = (state = [], { entry }) => {
  let { id, value } = entry;
  id = id || 0;

  return [...state, { id, value }];
};

const extendArray = (state = [], { entries }) => ([
  ...state,

  ...entries.map(({ id, value }) => ({
    id: id || 0,
    value
  }))
]);

const removeFromArray = (state = [], { id, ids }) => {
  ids = ids || [];
  if (!isUndefined(id)) {
    ids = [...ids, id];
  }

  let idSet = new Set(ids);
  return state.filter(({ id }) => !idSet.has(id));
};

const array = compose({
  append: appendToArray,
  extend: extendArray,
  remove: removeFromArray
}).defaultState([]);

/* objects */
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

const clearInMapping = (state = {}, { keys, key }) => {
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

const mapping = compose({
  set: setInMapping,
  clear: clearInMapping,
  clearAll: (state = {}, {}) => ({})
}).defaultState({});

export {
  scalar,
  object,
  string,
  number,
  bool,

  appendToArray,
  extendArray,
  removeFromArray,
  array,

  setInMapping,
  clearInMapping,
  mapping
};
