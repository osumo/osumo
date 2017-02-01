
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const actionProcess = (forms, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1));

  const form = analysisUtils.aggregateForm(forms, page);
  const task = 'kmeans';
  const inputs = {
    input_path: `FILE:${form.input_path}`,
    has_header: `BOOLEAN:${form.has_header}`,
    num_clusters: `INTEGER:${form.num_clusters}`
  };
  const extras = '"type":"table", "format":"csv"';
  const outputs = {
    centers: `FILE:${form.output_dir}:centers.csv(${extras})`,
    clusters: `FILE:${form.output_dir}:clusters.csv(${extras})`
  };
  const title = 'kmeans';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then((files) => {
      let centersId;
      let clustersId;

      files.forEach(({ fileId: fid, name }) => {
        if (name === 'centers.csv') { centersId = fid; }
        if (name === 'clusters.csv') { clustersId = fid; }
      });

      return { centersId, clustersId };
    })
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
  );
};

const main = () => (
  D(actions.registerAnalysisAction('kmeans', 'process', actionProcess))
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(D, 'kmeans'))
);

export default main;

