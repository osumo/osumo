import { isNil } from 'lodash';

import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';
import loadModel from '../utils/load-model';

import ItemModel from 'girder/models/ItemModel';
import { formatSize } from 'girder/misc';

const dispatch = store.dispatch.bind(store);

let priorData;
let applyResultElements;

const applyMatch = (data, page) => {
  let removeResultElements = null;
  if (applyResultElements) {
    removeResultElements = dispatch(
      actions.removeAnalysisElement(applyResultElements));
  }

  let index0 = data.states[priorData.page2Elements[0].id].value0;
  let index1 = data.states[priorData.page2Elements[0].id].value1;
  let originalAssignments = priorData.matchResults.assignments;
  let originalMode = priorData.matchResults.mode;

  let newAssignments = originalAssignments.map((_, i) => {
    let i0 = index0 ? index0[i] : i;
    let i1 = index1 ? index1[i] : i;

    let a = originalAssignments[i0].pair[0];
    let b = originalAssignments[i1].pair[1];

    return [a, b];
  })
  .filter(([a, b]) => (!isNil(a) && !isNil(b)))
  .map((pair) => ({ pair }));

  const metaDataPromise = Promise.map(
    priorData.inputFiles,
    (input) => loadModel(input, ItemModel)
      .then((item) => Object.entries(item.attributes.meta || {}))
  );

  const task = 'feature-apply';
  const inputs = {
    input_path_1: `FILE:${priorData.inputFiles[0]}`,
    input_path_2: `FILE:${priorData.inputFiles[1]}`,
    match_json: `STRING:${JSON.stringify({
      assignments: newAssignments,
      mode: originalMode
    })}`
  };

  const { states } = data;
  const outputs = {
    output_path_1: `FILE:x:${states[priorData.page1Elements[0].id].name}`,
    output_path_2: `FILE:x:${states[priorData.page1Elements[1].id].name}`
  };

  const title = 'feature-apply';
  const maxPolls = 40;

  const runPromise = analysisUtils.runTask(task, { inputs, outputs },
      { title, maxPolls })
    .then(
      ({
        output_path_1: { itemId: outputId1 },
        output_path_2: { itemId: outputId2 }
      }) => ({
        outputId1,
        outputId2
      })
    );

  return Promise.all([removeResultElements, metaDataPromise, runPromise])
    .then(([, meta, result]) => {
      let { outputId1, outputId2 } = result;
      return Promise.all([
        loadModel(outputId1, ItemModel),
        loadModel(outputId2, ItemModel)
      ])
        .then((items) => (
          Promise.map(
            items, (item, i) => Promise.mapSeries(
              meta[i],
              ([k, v]) => new Promise((resolve, reject) => {
                item.addMetadata(
                  k,
                  v,
                  () => resolve(),
                  ({ message }) => reject(new Error(message))
                );
              })
            )
          )
          .then(() => Promise.mapSeries(
            items,
            (item) => dispatch(actions.addAnalysisElement(
              {
                type: 'girderItem',
                downloadUrl: item.downloadUrl(),
                inlineUrl: item.downloadUrl({ contentDisposition: 'inline' }),
                name: item.name(),
                size: formatSize(item.get('size'))
              },
              priorData.page2
            ))
          ))
        ))
        .then((elements) => { applyResultElements = elements; });
    });
};

const main = (payload) => Promise.resolve(priorData = payload)
  .then(() => dispatch(actions.registerAnalysisAction(
    'feature-match-correction', 'applyMatch', applyMatch
  )))
  .then(() => {
    let element = priorData.page2ElementObjects[0];
    element.baseMatching = priorData.matchResults.assignments;
  })
  .then(() => Promise.mapSeries(
    priorData.page2ElementObjects,
    (e) => dispatch(actions.addAnalysisElement(e, priorData.page2))
  ))
  .then((elements) => {
    priorData.page2Elements = elements;
  })
  .then(() => dispatch(actions.enableAnalysisPage(priorData.page2)))
  .then(() => dispatch(actions.setCurrentAnalysisPage(priorData.page2)));

export default main;
