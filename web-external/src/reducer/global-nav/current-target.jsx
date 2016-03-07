import { compose } from '../../utils/reducer';
import { setScalar } from '../../utils/common-reducers';

export default compose({ set: setScalar }).defaultState('');
