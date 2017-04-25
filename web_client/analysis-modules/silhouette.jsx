import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import silhouette2 from './silhouette2';

const D = store.dispatch.bind(store);

let page1;

let page2;
let page2Elements;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1, {
    clear: true,
    disable: true,
    remove: false
  }));

  const state = analysisUtils.aggregateStateData(data, page);
  const task = 'silhouette';
  const inputs = {
    input_path: `FILE:${state.input_path}`,
    num_clusters: `INTEGER:${state.num_clusters}`
  };
  const outputs = {
    dataplot1: `FILE:${state.output_dir}:dataplot1.png`,
    dataplot2: `FILE:${state.output_dir}:dataplot2.png`
  };
  const title = 'silhouette plot';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then(({
      dataplot1: { fileId: dataplot1Id },
      dataplot2: { fileId: dataplot2Id }
    }) => ({
      dataplot1Id,
      dataplot2Id,
      page2,
      page2Elements
    }))
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(silhouette2)
  );
};

const main = () => (
  D(actions.registerAnalysisAction('silhouette', 'process', actionProcess))
  .then(() => analysisUtils.fetchAnalysisPage('silhouette'))
  .then((page) => D(actions.addAnalysisPage({ ...page, enabled: false })))
  .then((page) => (page1 = page))

  .then(() => analysisUtils.fetchAnalysisPage('silhouette2'))
  .then(({ elements, ...page }) => {
    page2Elements = elements || [];
    return D(actions.addAnalysisPage({ ...page, enabled: false }));
  })
  .then((page) => (page2 = page))

  .then(() => D(actions.enableAnalysisPage(page1)))
);

export default main;
