import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';
import igpseSubsetSelection from './igpse-subset-selection';

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

  const task = 'iGPSe';
  const inputs = {
    mrna_input_path: `FILE:${payload.mrnaInputId}`,
    mirna_input_path: `FILE:${payload.mirnaInputId}`,
    clinical_input_path: `FILE:${payload.clinicalInputId}`,
    mrna_clusters: `INTEGER:${state.mrnaClusters}`,
    mirna_clusters: `INTEGER:${state.mirnaClusters}`
  };
  let outputs = { clustersJSON: 'JSON' };
  const title = 'iGPSe';
  const maxPolls = 40;

  const runPromise = (
    D(actions.ensureScratchDirectory())

    .then((dir) => {
      payload.scratchDirectoryId = dir.attributes._id;

      const file = `FILE:${payload.scratchDirectoryId}:`;
      outputs.transferData = `${file}transfer-data.RData`;
      outputs.output_mrna_heatmap = `${file}mrna_heatmap.png`;
      outputs.output_mirna_heatmap = `${file}mirna_heatmap.png`;
    })

    .then(() => (
      analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })
    ))

    .then(({
      clustersJSON: { data: clusterData },
      transferData: { fileId: transferDataId },
      output_mrna_heatmap: { fileId: mrnaFileId },
      output_mirna_heatmap: { fileId: mirnaFileId }
    }) => ({
      ...payload,
      index: payload.index + 1,
      clusterData,
      transferDataId,
      mrnaFileId,
      mirnaFileId
    }))
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(igpseSubsetSelection)
  );

};

const main = (data) => (
  Promise.resolve(payload = data)

  .then(() => (
    D(actions.registerAnalysisAction(
      payload.pages.featureSelection, 'process', actionProcess
    ))
  ))

  .then(() => Promise.mapSeries(
    payload.elementObjects.featureSelection,
    (element) => (
      D(actions.addAnalysisElement(element, payload.pages.featureSelection))
    )
  ))

  .then(() => D(actions.enableAnalysisPage(payload.pages.featureSelection)))

  .then(() => (
    D(actions.setCurrentAnalysisPage(payload.pages.featureSelection))
  ))
);

export default main;
