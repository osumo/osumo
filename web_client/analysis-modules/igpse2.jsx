
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import igpse3 from './igpse3';

const D = store.dispatch.bind(store);

let priorData;

const actionProcess = (forms, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(2, {
    clear: false,
    disable: true,
    remove: false
  }));

  const form = analysisUtils.aggregateForm(forms, page);
  const task = 'iGPSe2';
  const inputs = {
    transferData: `FILE:${priorData.transferDataId}`,
    groups: `STRING:${JSON.stringify({
      GROUP1: form.pSets[0],
      GROUP2: form.pSets[1]
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
      .then(() => Promise.all([
        D(actions.updateAnalysisElement(
          data.mrnaMapElement, { fileId: data.mRNAFileId }
        )),
        D(actions.updateAnalysisElement(
          data.mirnaMapElement, { fileId: data.miRNAFileId }
        )),
        D(actions.updateAnalysisElement(
          data.pSetsElement, { inputData: data.clusterData }
        ))
      ]))
      .then(() => D(actions.enableAnalysisPage(data.page2)))
      .then(() => D(actions.setCurrentAnalysisPage(data.page2)))
  );
};

export default main;

