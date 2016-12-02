import { compose } from '../utils/reducer';
import { bool, object, string } from '../utils/common-reducers';
import dialog from './dialog';
import analysis from './analysis';

const rootReducer = compose().children({
  analysis,
  dialog,
  globalNavTarget: string,
  header: compose().children({
    dropdownOpened: bool
  }),
  loginInfo: compose().children({
    token: string,
    user: object
  })
});

export default rootReducer;
