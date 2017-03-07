
import analysisUtils from '../utils/analysis';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => (
  D(actions.updateAnalysisElement(
    data.survPlotElement, { fileId: data.survPlotId }
  ))
  .then(() => D(actions.enableAnalysisPage(data.page3)))
  .then(() => D(actions.setCurrentAnalysisPage(data.page3)))
);

export default main;

