
import { fromMapping } from "../../utils/reducer";

const add = (
    state=[],
    {
        id,
        name,
        icon,
        target,
        items
    }
) => {
    console.log("ADDING");
    console.log({ id, name, icon, target, items });
    let nextId = state.length;

    items = items || [{ id, name, icon, target }];

    return [
        ...state,
        ...items.map(({
            id,
            name,
            icon,
            target
        }) => ({
            id: (id !== 0 && !id) ? nextId++ : id,
            name,
            icon: `icon-${ icon }`,
            target
        }))
    ];
};

const remove = (
    state = [],
    { id }
) => {
    if(!isArray(id)) { id = [id]; }
    let idSet = new Set(id);
    return state.filter(({ id }) => !idSet.has(id));
};

const list = fromMapping({
    ADD_GLOBAL_NAV: add,
    REMOVE_GLOBAL_NAV: remove,
    other: []
});

export { add, remove };
export default list;

