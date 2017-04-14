
import { Promise } from '../utils/promise';

const main = (igpse) => (
  Promise.resolve()

  .then(() => igpse.registerAction('input', 'process'))
  .then(() => igpse.renderElements('input'))
  .then(() => igpse.enablePage('input'))
  .then(() => igpse.switchPage('input'))

  .then(() => igpse.tmp_dbg_0())
);

export default main;
