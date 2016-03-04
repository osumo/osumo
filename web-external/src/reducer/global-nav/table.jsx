
import { compose } from "../../utils/reducer";
import { setInMapping, unsetInMapping } from "../../utils/common-reducers";

export default compose({
    set: setInMapping,
    unset: unsetInMapping
}).defaultState({});

