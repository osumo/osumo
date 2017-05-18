import { Promise } from '../utils/promise';

const main = (igpse) => (
  Promise.resolve()
  .then(() => igpse.renderElements('survivalPlot'))
  .then(() => igpse.enablePage('survivalPlot'))
  .then(() => igpse.switchPage('survivalPlot'))
  .then(() => igpse.setBusy(false))
);

export default main;
