import { compose } from '../utils/reducer';
import { setScalar } from '../utils/common-reducers';

const currentUserReducer = compose({ set: setScalar }).defaultState('');

export default currentUserReducer;
