import { isString, isObject, isUndefined } from 'underscore';

import objectReduce from './object-reduce';
import isArraySubstring from './is-array-substring';

const createIdentityReducer =
  (defaultState = null) => (state = defaultState, action) => state;

const fromSubMapping = (mapping, defaults = {}) => {
  let { state: defaultState } = defaults;

  return (state = defaultState, action) => {
    let result = {};
    let changed = false;

    Object.entries(mapping).forEach(([key, value]) => {
      if (!(key in state) || action._composeParentType === key) {
        result[key] = value(state[key], action);
        changed = (changed || result[key] !== state[key]);
      } else {
        result[key] = state[key];
      }
    });

    return (changed ? result : state);
  };
};

const fromTypeMapping = (mapping, defaults = {}) => {
  let {
    state: defaultState,
    reducer: defaultReducer
  } = defaults;

  defaultReducer = defaultReducer || createIdentityReducer(defaultState);

  return (state = defaultState, action) => {
    let reducer = mapping[action.type];
    if (reducer) {
      delete action._composeParentType;
    } else {
      reducer = defaultReducer;
    }

    return reducer(state, action);
  };
};

const amendPrefix = (value, prefix) => (
  isString(value)
    ? `${ prefix }.${ value }`
    : (
      Object
      .entries(value)
      .map(([k, v]) => [k, amendPrefix(v, prefix)])
      .reduce(objectReduce, {})
    )
);

const makeComposedBaseReducer = (
  simpleMap = {},
  complexMap = [],
  subMapping = {}
) => {
  let subMappingReducer = fromSubMapping(subMapping);

  return fromTypeMapping(
    /* Try searching for a direct reducer among the simple mappings. */
    simpleMap,
    {
      /* default reducer for when the above search fails */
      reducer: (state, action) => {
        let { type } = action;
        let typePattern = type.split('.');

        /* Check for a match with a complex type mapping */
        let [, targetReducer] = complexMap.find(
          ([pattern, ..._]) => isArraySubstring(pattern, typePattern)
        ) || [];

        /*
         * If the above search does not return a reducer, the target
         * reducer must be a descendant.
         */
        if (targetReducer) {
          delete action._composeParentType;
        } else {
          let [parentType, ...subType] = typePattern;
          subType = subType.join('.');

          targetReducer = subMappingReducer;
          action = {
            ...action,
            type: subType,
            _composeParentType: parentType
          };
        }

        return targetReducer(state, action);
      }
    }
  );
};

const makeComposedWrappedReducer = (
  simpleMap,
  complexMap,
  subMapping,
  defaultState,
  baseActions
) => {
  /* child reducers */
  let baseReducer = makeComposedBaseReducer(simpleMap, complexMap, subMapping);

  let actions = {
    /* Add all child action namespaces under their given keys. */
    ...(
      Object
      .entries(subMapping)
      .map(([key, value]) => [key, amendPrefix(value(), key)])
      .reduce(objectReduce, {})
    ),

    ...baseActions
  };

  /*
   * Instead of returning the main reducer, a wrapper reducer is returned.
   *
   * The wrapper reducer forwards to the main reducer, except for the
   * following considerations:
   *
   *   - When called with no arguments, the action type namespace for the
   *     reducer is returned.
   *
   *   - reducer.children(subMappings) returns a new version of this reducer
   *     where the child reducers have been set to the given reducers.
   *
   *   - reducer.defaultState(defaultState) returns a new version of this
   *     reducer where the default state has been set to the given value.
   */
  const wrappedReducer = (state, action) => (
    isUndefined(action)
    ? actions
    : baseReducer(
        isUndefined(state) ? defaultState : state,
        action
      )
  );

  Object.assign(wrappedReducer, {
    children: (newSubMapping) => makeComposedWrappedReducer(
      simpleMap,
      complexMap,
      newSubMapping,
      isObject(defaultState) ? defaultState : {},
      baseActions
    ),

    defaultState: (newDefaultState) => makeComposedWrappedReducer(
      simpleMap,
      complexMap,
      subMapping,
      newDefaultState,
      baseActions
    )
  });

  return wrappedReducer;
};

const compose = (typeMapping = {}) => {
  /*
   * Separate the 'complex' type mappings from the others.
   *
   * Complex type mappings have a period in their keys.  These kind of
   * mappings are intended to be used by a compound reducer when it wishes to
   * intercept an action originally intended for one of its descendants.
   *
   * For example, a compound reducer may use a complex mapping to add
   * specialized logic whereby the action may be amended before passing along
   * to the appropriate child; rerouted to some other reducer; or supressed,
   * entirely.
   *
   * Matching action types to complex entries can not be done by a direct
   * lookup, but must instead be done by prefix.  For action types that match
   * multiple complex entries, the matching entry with the longest common
   * prefix (i.e.: the most specific entry) will be used.
   */
  let simpleMap = {};
  let complexMap = [];

  Object.entries(typeMapping)
    .forEach(([key, value]) => {
      let isComplex = (key.indexOf('.') >= 0);
      if (isComplex) {
        /*
         * For complex mappings, the key is transformed into a
         * 'pattern', or the sequence of substrings separated by
         * periods.
         *
         * When matching, the action type string is similarly
         * transformed.  A match is found when each string in the
         * resulting sequence matches their corresponding substring in
         * the pattern for each substring in the pattern.
         */
        let pattern = key.split('.');
        complexMap.push([pattern, value]);
      } else {
        simpleMap[key] = value;
      }
    });

  /*
   * Sort the complex mappings in decreasing order of N, where N is the number
   * of substrings in the pattern.
   */
  complexMap.sort(([a, ..._a], [b, ..._b]) => (b.length - a.length));

  /*
   * Create some internal state for the reducer and functions to modify that
   * state.
   */

  /*
   * baseActions: entries for each direct action among the simple mappings.
   *
   * Complex mappings are not part of the returned namespace because they are
   * meant to be used to intercept actions for which there is otherwise a
   * suitable reducer deeper in the reducer tree.
   */
  const baseActions = (
    Object
    .keys(simpleMap)
    .map((key) => ([key, key]))
    .reduce(objectReduce, {})
  );

  /* child reducers */
  let subMapping = {};
  let defaultState = null;

  return makeComposedWrappedReducer(
    simpleMap,
    complexMap,
    subMapping,
    defaultState,
    baseActions
  );
};

export {
  compose,
  createIdentityReducer,
  fromSubMapping,
  fromTypeMapping
};
