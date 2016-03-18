import { compose } from '../../utils/reducer';
import { setScalar } from '../../utils/common-reducers';

const currentTargetReducer = compose({ set: setScalar }).defaultState('');
export default currentTargetReducer;
