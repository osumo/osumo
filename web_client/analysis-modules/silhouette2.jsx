import actions from '../actions';
import { Promise } from '../utils/promise';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => {
  let promise = Promise.resolve();

  data.page2Elements[0].elements[0].fileId = data.dataplot1Id;
  data.page2Elements[0].elements[1].fileId = data.dataplot2Id;

  data.page2Elements.forEach((e) => (
    promise = promise.then(() => D(
      actions.addAnalysisElement(e, data.page2)
    ))
  ));

  (
    promise
    .then(() => D(actions.enableAnalysisPage(data.page2)))
    .then(() => D(actions.setCurrentAnalysisPage(data.page2)))
    .then(() => D(actions.setAnalysisBusy(false)))
  );
};

export default main;
