
import { Promise } from '../utils/promise';

const main = (igpse) => (
  Promise.resolve()

  .then(() => Promise.all([
    igpse.registerAction('featureSelection', 'process'),
    igpse.registerAction('featureSelection', 'mrnaFeatureUpdate'),
    igpse.registerAction('featureSelection', 'mirnaFeatureUpdate')
  ]))

  .then(() => igpse.renderElements('featureSelection'))
  .then(() => igpse.enablePage('featureSelection'))
  .then(() => igpse.switchPage('featureSelection'))
);

export default main;
