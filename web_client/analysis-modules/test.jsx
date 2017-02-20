
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store, rest } from '../globals';
import igpse2 from './igpse2';

const D = store.dispatch.bind(store);

const actionProcess = (forms, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1));

  const form = analysisUtils.aggregateForm(forms, page);
  const task = 'test';
  console.log("what is in form");
  console.log(form)
  const inputs = {
    input_path_1: `FILE:${ form.input_path_1 }`,
    input_path_2: `FILE:${ form.input_path_2 }`,
    input_path_3: `FILE:${ form.input_path_3 }`,
    metadata_1: `STRING:${ form.metadata_1}`,
    metadata_2: `STRING:${ form.metadata_2}`,
    metadata_3: `STRING:${ form.metadata_3}`
  };
  const outputs = {
    clustersJSON: `FILE:${form.output_dir}:clusters.json`,
    transferData: `FILE:${form.output_dir}:transfer-data.RData`,
    output_mrna_heatmap: `FILE:${form.output_dir}:mrna_heatmap.png`,
    output_mirna_heatmap: `FILE:${form.output_dir}:mirna_heatmap.png`
  };
  const title = 'Test Workflow';
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
        rest({ path: `file/${ clustersId }/download` })
          .then(({ response }) => ({
            mRNAFileId,
            miRNAFileId,
            transferDataId,
            clusterData: response,
            outputDirId: form.output_dir
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
  D(actions.registerAnalysisAction('test', 'process', actionProcess))
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(D, 'test'))
);

export default main;
