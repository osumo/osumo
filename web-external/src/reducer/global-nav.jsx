import { compose } from '../utils/reducer';
import currentTargetReducer from './global-nav/current-target';
import list from './global-nav/list';
import table from './global-nav/table';

export default compose({
  /*
   * Instead of blindly setting the current target, make sure that it
   * actually has a matching component.
   *
   * This extra logic is implemented using a complex type mapping.
   */
  'currentTarget.set': (state = {}, action) => {
    let { currentTarget, table } = state;
    let { value } = action;

    let skip = !(value in table);
    if (skip) { return state; }

    return {
      ...state,
      currentTarget: currentTargetReducer(
        currentTarget,
        {
          ...action,
          type: currentTargetReducer().set
        }
      )
    };
  }
}).children({
  currentTargetReducer,
  list,
  table
});

