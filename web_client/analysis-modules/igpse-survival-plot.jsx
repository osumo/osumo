import actions from '../actions';
import { Promise } from '../utils/promise';
import { store } from '../globals';

const D = store.dispatch.bind(store);

let payload;

const main = (data) => (
  Promise.resolve(payload = data)

  .then(() => {
    data.elementObjects.survivalPlot[0].fileId = data.survPlotId;
  })

  .then(() => Promise.mapSeries(
    payload.elementObjects.survivalPlot,
    (element) => (
      D(actions.addAnalysisElement(element, payload.pages.survivalPlot))
    )
  ))

  .then((elements) => (payload.elements.survivalPlot = elements))

  .then(() => D(actions.enableAnalysisPage(payload.pages.survivalPlot)))

  .then(() => (
    D(actions.setCurrentAnalysisPage(payload.pages.survivalPlot))
  ))
);

export default main;

