import { Promise } from '../utils/promise';

const main = (igpse) => (
  Promise.resolve()
  .then(() => igpse.registerAction('input', 'process'))
  .then(() => igpse.renderElements('input'))
  .then(() => igpse.enablePage('input'))
  .then(() => igpse.switchPage('input'))
);

export default main;
