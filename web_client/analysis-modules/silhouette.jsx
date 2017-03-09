
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import silhouette2 from './silhouette2';

const D = store.dispatch.bind(store);

let page2;
let plot1Element;
let plot2Element;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(1, {
    clear: false,
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

    .then((files) => {
      let dataplot1Id;
      let dataplot2Id;

      files.forEach(({ fileId: fid, name }) => {
        if (name === 'dataplot1.png') { dataplot1Id = fid; }
        if (name === 'dataplot2.png') { dataplot2Id = fid; }
      });

      return {
        dataplot1Id,
        dataplot2Id,
        page2,
        plot1Element,
        plot2Element
      };
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
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(
      D, {
        key: 'silhouette2',
        postprocess: (type, obj) => {
          if (type === 'page') {
            page2 = obj;
          } else if (type === 'element') {
            if (obj.key === 'plot1') {
              plot1Element = obj;
            } else if (obj.key === 'plot2') {
              plot2Element = obj;
            }
          }
        }
      }
    ))
    .then((page) => D(actions.disableAnalysisPage(page)))
);

export default main;

