import { compose } from '../utils/reducer';
import { object, mapping, string } from '../utils/common-reducers';

const dialogReducer = compose().children({
  componentKey: string,
  errorField: string,
  errorMessage: string,
  focus: compose().children({
    field: string,
    time: object
  }),
  form: mapping
});

export default dialogReducer;
