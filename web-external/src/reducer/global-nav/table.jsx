import { compose } from '../../utils/reducer';
import { setInMapping, unsetInMapping } from '../../utils/common-reducers';

const globalNavTableReducer = compose({
  set: setInMapping,
  unset: unsetInMapping
}).defaultState({});

export default globalNavTableReducer;
