
import { isFunction } from "underscore";

export const identity = (state, ...args) => mapping;

export const compose = (mapping) => (state={}, action) => (
    Object.keys(mapping).reduce(
        (partial, key) => (
            partial[key] = mapping[key](state[key], action),
            partial
        ), {}
    )
);

export const fromMapping = (mapping) => {
    let otherReducer = mapping.other;
    if(!isFunction(otherReducer)) {
        let defaultState = otherReducer;
        otherReducer = (state=defaultState, action) => state;
    }

    mapping.other = otherReducer;

    return (state, action) => (
        (mapping[action.type] || mapping.other)(state, action)
    );
};

