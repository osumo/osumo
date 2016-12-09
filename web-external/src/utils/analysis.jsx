import { isUndefined } from 'lodash';
import objectReduce from './object-reduce';

export const aggregateForm = (forms, page) => (
  (page.elements || [])
    .map(({ key }) => key)
    .filter((key) => !isUndefined(key))
    .map((key) => [
      key,
      (
        (
          forms[page.name] || {}
        )[key] || {}
      ).value
    ])
    .reduce(objectReduce, {})
);

export default {
  aggregateForm
};
