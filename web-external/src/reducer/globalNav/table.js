
import { isArray, isUndefined } from "underscore";
import { fromMapping } from "../../utils/reducer";

const set = (
    state={},
    { type, mappings, ...rest }
) => ({
    ...state,
    ...rest,
    ...mappings
});

const unset = (
    state={},
    { target, targets }
) => {
    if(isUndefined(target)) { target = []; }
    if(!isArray(target)) { target = [target]; }

    targets = new Set([
        ...target,
        ...(targets || [])
    ]);

    return Object.keys(state).filter(key => !targets.has(key)).reduce(
        (partial, key) => (
            partial[key] = state[key],
            partial
        ), {}
    );
};

const table = fromMapping({
    SET_GLOBAL_NAV_TARGET: set,
    UNSET_GLOBAL_NAV_TARGET: unset,
    other: {}
});

export { set, unset };
export default table;

