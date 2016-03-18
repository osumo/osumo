import { compose } from '../../utils/reducer';
import {
  appendToList,
  extendList,
  removeFromList
} from '../../utils/common-reducers';

const globalNavListReducer = compose({
  append: appendToList,
  extend: extendList,
  remove: removeFromList
}).defaultState([]);

export default globalNavListReducer;
