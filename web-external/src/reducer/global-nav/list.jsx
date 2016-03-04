
import { compose } from "../../utils/reducer";
import {
    appendToList,
    extendList,
    removeFromList
} from "../../utils/common-reducers";

export default compose({
    append: appendToList,
    extend: extendList,
    remove: removeFromList
}).defaultState([]);

