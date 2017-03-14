
import analysisUtils from '../utils/analysis';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => {
  let promise = Promise.resolve();

  data.page3Elements[0].fileId = data.survPlotId;

  data.page3Elements.forEach((e) => (
    promise = promise.then(() => D(
      actions.addAnalysisElement(e, data.page3)
    ))
  ));

  (
    promise
    .then(() => D(actions.enableAnalysisPage(data.page3)))
    .then(() => D(actions.setCurrentAnalysisPage(data.page3)))
  );
};

export default main;

