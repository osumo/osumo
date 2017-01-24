
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store, rest } from '../globals';

import surv2 from './surv2';

const D = store.dispatch.bind(store);

const actionProcess = (forms, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1));

  const form = analysisUtils.aggregateForm(forms, page);
  const task = 'surv';
  const inputs = {
    input_rdata: `FILE:${ form.input_rdata }`,
    num_clusters: `INTEGER:${ form.num_clusters }`
  };
  const outputs = {
    fit: `FILE:${ form.output_dir }:fit.rdata`,
    sdf: `FILE:${ form.output_dir }:sdf.rdata`,
    dataplot: `FILE:${ form.output_dir }:survivor-plot.png`
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

      return { fitId, sdfId, dataplotId };
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
);

export default main;

