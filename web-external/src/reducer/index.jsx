import { compose } from '../utils/reducer';
import currentUser from './current-user';
import globalNav from './global-nav';

const rootReducer = compose().children({
  currentUser,
  globalNav
});

export default rootReducer;
