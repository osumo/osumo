import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1, {
    clear: false,
    disable: true,
    remove: false
  }));

  const state = analysisUtils.aggregateStateData(data, page);
  const task = 'kmeans';
  const inputs = {
    input_path: `FILE:${state.input_path}`,
    has_header: `BOOLEAN:${state.has_header}`,
    num_clusters: `INTEGER:${state.num_clusters}`
  };
  const extras = '"type":"table", "format":"csv"';
  const outputs = {
    centers: `FILE:${state.output_dir}:centers.csv(${extras})`,
    clusters: `FILE:${state.output_dir}:clusters.csv(${extras})`
  };
  const title = 'kmeans';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then(({
      centers: { fileId: centersId },
      clusters: { fileId: clustersId }
    }) => ({
      centersId,
      clustersId
    }))
  );

  return D(actions.setAnalysisBusy(true))
    .then(() => Promise.all([truncatePromise, runPromise]))
    .then(([, result]) => result);
};

const main = () => (
  D(actions.registerAnalysisAction('kmeans', 'process', actionProcess))
  .then(() => analysisUtils.fetchAnalysisPage('kmeans'))
  .then((page) => D(actions.addAnalysisPage(page)))
  .then(() => D(actions.setAnalysisBusy(false)))
);

export default main;
