
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import surv2 from './surv2';

const D = store.dispatch.bind(store);

let page2;
let survPlotElement;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1, {
    clear: false,
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

    .then((files) => {
      let fitId;
      let sdfId;
      let dataplotId;

      files.forEach(({ fileId: fid, name }) => {
        if (name === 'fit.rdata') { fitId = fid; }
        if (name === 'sdf.rdata') { sdfId = fid; }
        if (name === 'survivor-plot.png') { dataplotId = fid; }
      });

      return { fitId, sdfId, dataplotId, page2, survPlotElement };
    })
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(surv2)
  );
};

const main = () => (
  D(actions.registerAnalysisAction('surv', 'process', actionProcess))
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(D, 'surv'))
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(
      D, {
        key: 'surv2',
        postprocess: (type, obj) => {
          if (type === 'page') {
            page2 = obj;
          } else if (type === 'element' && obj.key === 'survPlot') {
            survPlotElement = obj;
          }
        }
      }
    ))
    .then((page) => D(actions.disableAnalysisPage(page)))
);

export default main;

