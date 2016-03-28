import { compose } from './utils/reducer';
import currentUser from './reducer/current-user';
import globalNav from './reducer/global-nav';

const rootReducer = compose().children({
  currentUser,
  globalNav
});

export default rootReducer;
