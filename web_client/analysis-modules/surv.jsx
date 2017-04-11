
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import surv2 from './surv2';

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
  const task = 'surv';
  const inputs = {
    input_rdata: `FILE:${state.input_rdata}`,
    num_clusters: `INTEGER:${state.num_clusters}`
  };
  const outputs = {
    fit: `FILE:${state.output_dir}:fit.rdata`,
    sdf: `FILE:${state.output_dir}:sdf.rdata`,
    dataplot: `FILE:${state.output_dir}:survivor-plot.png`
  };
  const title = 'survivor plot';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then(({
      fit: { fileId: fitId },
      sdf: { fileId: sdfId },
      dataplot: { fileId: dataplotId }
    }) => ({
      fitId,
      sdfId,
      dataplotId,
      page2,
      page2Elements
    }))
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(surv2)
  );
};

const main = () => (
  D(actions.registerAnalysisAction('surv', 'process', actionProcess))

  .then(() => analysisUtils.fetchAnalysisPage('surv'))
  .then((page) => D(actions.addAnalysisPage({ ...page, enabled: false })))
  .then((page) => (page1 = page))

  .then(() => analysisUtils.fetchAnalysisPage('surv2'))
  .then(({ elements, ...page }) => {
    page2Elements = elements || [];
    return D(actions.addAnalysisPage({ ...page, enabled: false }));
  })
  .then((page) => (page2 = page))

  .then(() => D(actions.enableAnalysisPage(page1)))
);

export default main;

