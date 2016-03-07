
import { compose } from './utils/reducer';
import globalNav from './reducer/global-nav';

const root = compose().children({ globalNav });

export default root;

