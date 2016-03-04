
import { fromMapping } from "../../utils/reducer";

const set = (state="", { target }) => target;

const currentTarget = fromMapping({
    SET_CURRENT_GLOBAL_NAV_TARGET: set,
    other: ""
});

export { set };
export default currentTarget;

