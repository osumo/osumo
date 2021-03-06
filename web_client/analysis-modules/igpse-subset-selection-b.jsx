import { Promise } from '../utils/promise';

const main = (igpse) => (
  Promise.resolve()
  .then(() => igpse.registerAction('subsetSelection', 'process'))
  .then(() => igpse.renderElements('subsetSelectionB', 'subsetSelection'))
  .then(() => igpse.setBusy(false))
);

export default main;
