import { Promise } from '../utils/promise';

const main = (igpse) => (
  Promise.resolve()
  .then(() => igpse.registerAction('subsetSelection', 'cluster'))
  .then(() => igpse.renderElements('subsetSelection'))
  .then(() => igpse.enablePage('subsetSelection'))
  .then(() => igpse.switchPage('subsetSelection'))
  .then(() => igpse.setBusy(false))
);

export default main;
