import { compose } from '../utils/reducer';
import currentTargetReducer from './global-nav/current-target';
import list from './global-nav/list';
import table from './global-nav/table';

const globalNavReducer = compose({
  /*
   * Instead of blindly setting the current target, make sure that it
   * actually has a matching component.
   *
   * This extra logic is implemented using a complex type mapping.
   */
  'currentTarget.set': (state = {}, action) => {
    let { currentTarget: currentTargetState, table } = state;
    let { value } = action;

    let skip = !(value in table);
    if (skip) { return state; }

    return {
      ...state,
      currentTarget: currentTargetReducer(
        currentTargetState,
        {
          ...action,
          type: currentTargetReducer().set
        }
      )
    };
  }
}).children({
  currentTarget: currentTargetReducer,
  list,
  table
});

export default globalNavReducer;
