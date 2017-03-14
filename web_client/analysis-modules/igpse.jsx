
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store, rest } from '../globals';
import igpse2 from './igpse2';

const D = store.dispatch.bind(store);

let page1;

let page2;
let page2Elements;

let page3;
let page3Elements;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1, {
    clear: true,
    disable: true,
    remove: false
  }));

  const state = analysisUtils.aggregateStateData(data, page);

  const task = 'iGPSe';
  const inputs = {
    mrna_input_path: `FILE:${state.mrna_input_path}`,
    mirna_input_path: `FILE:${state.mirna_input_path}`,
    clinical_input_path: `FILE:${state.clinical_input_path}`,
    mrna_clusters: `INTEGER:${state.mrna_clusters}`,
    mirna_clusters: `INTEGER:${state.mirna_clusters}`
  };
  const outputs = {
    clustersJSON: `FILE:${state.output_dir}:clusters.json`,
    transferData: `FILE:${state.output_dir}:transfer-data.RData`,
    output_mrna_heatmap: `FILE:${state.output_dir}:mrna_heatmap.png`,
    output_mirna_heatmap: `FILE:${state.output_dir}:mirna_heatmap.png`
  };
  const title = 'iGPSe';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then((files) => {
      let mRNAFileId;
      let miRNAFileId;
      let clustersId;
      let transferDataId;

      files.forEach(({ fileId: fid, name }) => {
        if (name === 'mrna_heatmap.png') { mRNAFileId = fid; }
        if (name === 'mirna_heatmap.png') { miRNAFileId = fid; }
        if (name === 'clusters.json') { clustersId = fid; }
        if (name === 'transfer-data.RData') { transferDataId = fid; }
      });
      return (
        rest({ path: `file/${clustersId}/download` })
          .then(({ response }) => ({
            mRNAFileId,
            miRNAFileId,
            transferDataId,
            clusterData: response,
            outputDirId: state.output_dir,
            page2,
            page2Elements,
            page3,
            page3Elements
          }))
      );
    })
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(igpse2)
  );
};

const main = () => (
  D(actions.registerAnalysisAction('igpse', 'process', actionProcess))

  .then(() => analysisUtils.fetchAnalysisPage('igpse'))
  .then((page) => D(actions.addAnalysisPage({ ...page, enabled: false })))
  .then((page) => (page1 = page))

  .then(() => analysisUtils.fetchAnalysisPage('igpse2'))
  .then(({ elements, ...page }) => {
    page2Elements = elements || [];
    return D(actions.addAnalysisPage({ ...page, enabled: false }));
  })
  .then((page) => (page2 = page))

  .then(() => analysisUtils.fetchAnalysisPage('igpse3'))
  .then(({ elements, ...page }) => {
    page3Elements = elements || [];
    return D(actions.addAnalysisPage({ ...page, enabled: false }));
  })
  .then((page) => (page3 = page))

  .then(() => D(actions.enableAnalysisPage(page1)))
);

export default main;
