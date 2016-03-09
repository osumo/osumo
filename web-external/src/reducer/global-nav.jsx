import { compose } from '../utils/reducer';
import currentTarget from './global-nav/current-target';
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
    // TODO(opadron): cTarget is not used anywhere in this function. Are the
    // references to currentTarget below meant to be cTarget instead?
    let { currentTarget: cTarget, table } = state;
    let { value } = action;

    let skip = !(value in table);
    if (skip) { return state; }

    return {
      ...state,
      currentTarget: currentTarget(
        currentTarget,
        {
          ...action,
          type: currentTarget().set
        }
      )
    };
  }
}).children({
  currentTarget,
  list,
  table
});

