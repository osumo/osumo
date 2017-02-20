
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import igpse3 from './igpse3';

const D = store.dispatch.bind(store);

const actionProcess = (forms, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(2));

  const form = analysisUtils.aggregateForm(forms, page);
  const task = 'iGPSe2';
  const inputs = {
    transferData: `FILE:${form.hidden.transferData}`,
    groups: `STRING:${JSON.stringify({
      GROUP1: form.pSets[0],
      GROUP2: form.pSets[1]
    })}`
  };
  const outputs = {
    dataplot: `FILE:${form.hidden.outputDir}:dataplot.png`
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

      return dataPlotId;
    })
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(igpse3)
  );
};

const main = (data) => (
  D(actions.registerAnalysisAction('igpse2', 'process', actionProcess))
    .then(() => analysisUtils.fetchAndProcessAnalysisPage(
      D, {
        key: 'igpse2',
        preprocess: (page) => {
          page.ui[0].fileId = data.mRNAFileId;
          page.ui[1].fileId = data.miRNAFileId;
          page.ui[2].inputData = data.clusterData;
        },
        postprocess: (type, obj) => {
          if (type === 'element') {
            if (obj.key === 'hidden') {
              return D(actions.updateAnalysisElementState(
                obj, {
                  value: {
                    transferData: data.transferDataId,
                    outputDir: data.outputDirId
                  }
                })
              ).then(() => obj);
            }
          }
        }
      }
    ))
);

export default main;

