
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => (
  Promise.all([
    D(actions.updateAnalysisElement(
      data.plot1Element, { fileId: data.dataplot1Id }
    )),
    D(actions.updateAnalysisElement(
      data.plot2Element, { fileId: data.dataplot2Id }
    ))
  ])
  .then(() => D(actions.enableAnalysisPage(data.page2)))
  .then(() => D(actions.setCurrentAnalysisPage(data.page2)))
);

export default main;

