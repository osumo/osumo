import { compose } from '../utils/reducer';
import { array, mapping, string } from '../utils/common-reducers';

const globalNavReducer = compose({
  /*
   * Instead of blindly setting the current target, make sure that it
   * actually has a matching component.
   *
   * This extra logic is implemented using a complex type mapping.
   */
  'currentTarget.set': (state = {}, action) => {
    let { currentTarget, table } = state;
    let { value } = action;

    let newState = state;
    let skip = !(value in table);
    if (!skip) {
      let modifiedAction = {
        ...action,
        type: string().set
      };

      let newTarget = string(currentTarget, modifiedAction);

      if (newTarget !== currentTarget) {
        newState = {
          ...state,
          currentTarget: newTarget
        };
      }
    }

    return newState;
  }
}).children({
  currentTarget: string,
  list: array,
  table: mapping
});

export default globalNavReducer;
