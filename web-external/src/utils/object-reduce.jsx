
import { isArray } from "underscore";

const objectReduce = (partial, item) => {
    if(isArray(partial)) {
        let [k, v] = partial;
        partial = {};
        partial[k] = v;
    }

    let [k, v] = item;
    partial[k] = v;
    return partial;
};

export default objectReduce;

