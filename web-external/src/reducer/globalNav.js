
import { compose } from "../utils/reducer";
import currentTarget from "./globalNav/currentTarget";
import list from "./globalNav/list";
import table from "./globalNav/table";

/*
 * Instead of blindly setting the current target, make sure that it actually
 * has a matching component.
 *
 * This extra logic is implemented using a reducer that wraps the composed
 * reducer.
 */
const internalReducer = compose({
    currentTarget,
    list,
    table
});

const globalNav = (state={}, action) => {
    let { table={} } = state;
    let { type, target } = action;

    let useInternalReducer = (
        type !== "SET_CURRENT_GLOBAL_NAV_TARGET" ||
        target in table
    );

    if(useInternalReducer) {
        state = internalReducer(state, action);
    }

    return state;
};

export default globalNav;

