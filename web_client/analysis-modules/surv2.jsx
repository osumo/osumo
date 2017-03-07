
import analysisUtils from '../utils/analysis';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => (
  D(actions.updateAnalysisElement(
    data.survPlotElement, { fileId: data.dataplotId }
  ))
  .then(() => D(actions.enableAnalysisPage(data.page2)))
  .then(() => D(actions.setCurrentAnalysisPage(data.page2)))
);

export default main;

