
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import silhouette2 from './silhouette2';

const D = store.dispatch.bind(store);

const actionProcess = (forms, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1));

  const form = analysisUtils.aggregateForm(forms, page);
  const task = 'silhouette';
  const inputs = {
    input_path: `FILE:${ form.input_path }`,
    num_clusters: `INTEGER:${ form.num_clusters }`
  };
  const outputs = {
    dataplot1: `FILE:${ form.output_dir }:dataplot1.png`,
    dataplot2: `FILE:${ form.output_dir }:dataplot2.png`
  };
  const title = 'silhouette plot';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then((files) => {
      let dataplot1Id;
      let dataplot2Id;

      files.forEach(({ fileId: fid, name }) => {
        if (name === 'dataplot1.png') { dataplot1Id = fid; }
        if (name === 'dataplot2.png') { dataplot2Id = fid; }
      });

      return { dataplot1Id, dataplot2Id };
    })
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(silhouette2)
  );
};

const main = () => (
  D(actions.registerAnalysisAction('silhouette', 'process', actionProcess))
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(D, 'silhouette'))
);

export default main;

