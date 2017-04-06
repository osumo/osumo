import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';
import igpseSurvivalPlot from './igpse-survival-plot';

const D = store.dispatch.bind(store);

let payload;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(
    payload.index + 1,
    {
      clear: true,
      disable: true,
      remove: false
    }
  ));

  const state = analysisUtils.aggregateStateData(data, page);

  const task = 'igpse-survival-plot';
  const inputs = {
    transferData: `FILE:${payload.transferDataId}`,
    groups: `STRING:${JSON.stringify({
      GROUP1: state.pSets[0],
      GROUP2: state.pSets[1]
    })}`
  };

  const outputs = {
    dataplot: `FILE:${payload.scratchDirectoryId}:dataplot.png`
  };

  const title = 'iGPSe Survival Plot';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then(({
      dataplot: { fileId: survPlotId }
    }) => ({
      ...payload,
      survPlotId
    }))
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(igpseSurvivalPlot)
  );
};

const main = (data) => (
  Promise.resolve(payload = data)

  .then(() => (
    D(actions.registerAnalysisAction(
      payload.pages.subsetSelection, 'process', actionProcess
    ))
  ))

  .then(() => {
    data.elementObjects.subsetSelection[0].elements[0].fileId = data.mrnaFileId;
    data.elementObjects.subsetSelection[0].elements[1].fileId = data.mirnaFileId;
    data.elementObjects.subsetSelection[1].inputData = data.clusterData;
  })

  .then(() => Promise.mapSeries(
    payload.elementObjects.subsetSelection,
    (element) => (
      D(actions.addAnalysisElement(element, payload.pages.subsetSelection))
    )
  ))

  .then((elements) => (payload.elements.subsetSelection = elements))

  .then(() => D(actions.enableAnalysisPage(payload.pages.subsetSelection)))

  .then(() => (
    D(actions.setCurrentAnalysisPage(payload.pages.subsetSelection))
  ))
);

export default main;

