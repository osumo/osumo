
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import igpse3 from './igpse3';

const D = store.dispatch.bind(store);

let priorData;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(2, {
    clear: true,
    disable: true,
    remove: false
  }));

  const state = analysisUtils.aggregateStateData(data, page);
  const task = 'iGPSe2';
  const inputs = {
    transferData: `FILE:${priorData.transferDataId}`,
    groups: `STRING:${JSON.stringify({
      GROUP1: state.pSets[0],
      GROUP2: state.pSets[1]
    })}`
  };
  const outputs = {
    dataplot: `FILE:${priorData.outputDirId}:dataplot.png`
  };

  const title = 'iGPSe Part 2';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then((files) => {
      let dataPlotId;

      files.forEach(({ fileId: fid, name }) => {
        if (name === 'dataplot.png') { dataPlotId = fid; }
      });

      return {
        survPlotId: dataPlotId,
        ...priorData
      };
    })
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(igpse3)
  );
};

const main = (data) => {
  priorData = data;
  return (
    D(actions.registerAnalysisAction('igpse2', 'process', actionProcess))
    .then(() => {
      let promise = Promise.resolve();

      data.page2Elements[0].elements[0].fileId = data.mRNAFileId;
      data.page2Elements[0].elements[1].fileId = data.miRNAFileId;
      data.page2Elements[1].inputData = data.clusterData;

      data.page2Elements.forEach((e) => (
        promise = promise.then(() => D(
          actions.addAnalysisElement(e, data.page2)
        ))
      ));

      return promise;
    })

    .then(() => D(actions.enableAnalysisPage(data.page2)))

    .then(() => D(actions.setCurrentAnalysisPage(data.page2)))
  );
};

export default main;
