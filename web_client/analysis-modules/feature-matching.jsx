import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import featureMatchingCorrection from './feature-matching-correction';

const dispatch = store.dispatch.bind(store);

let page1;
let page1Elements;
let page1ElementObjects;
let page2;
let page2ElementObjects;
let inputFiles = [null, null];

const computeMatch = (data, page) => {
  const truncatePromise = dispatch(actions.truncateAnalysisPages(
    1,
    {
      clear: true,
      disable: true,
      remove: false
    }
  ));

  const state = analysisUtils.aggregateStateData(data, page);

  inputFiles[0] = state.input1;
  inputFiles[1] = state.input2;

  const task = 'feature-match';
  const inputs = {
    input_path_1: `FILE:${state.input1}`,
    input_path_2: `FILE:${state.input2}`,
    match_spec: `STRING:cc`
  };
  const outputs = { match_result: 'JSON' };
  const title = 'feature-match';
  const maxPolls = 40;

  const runPromise = analysisUtils.runTask(
      task, { inputs, outputs }, { title, maxPolls }
    )
    .then(({ match_result: { data: result } }) => {
      return result;
    });

  return dispatch(actions.setAnalysisBusy(true))
    .then(() => Promise.all([truncatePromise, runPromise]))
    .then(([, matchResults]) => ({
      matchResults,
      inputFiles,
      page1,
      page1ElementObjects,
      page1Elements,
      page2,
      page2ElementObjects
    }))
    .then(featureMatchingCorrection);
};

const main = () => Promise.resolve()
  .then(() => dispatch(actions.registerAnalysisAction(
    'feature-match', 'computeMatch', computeMatch)
  ))

  .then(() => analysisUtils.fetchAnalysisPage('feature-match'))
  .then(({ elements, ...page }) => {
    page1ElementObjects = elements || [];
    return dispatch(actions.addAnalysisPage({ ...page, enabled: false }));
  })
  .then((page) => {
    page1 = page;
  })
  .then(() => Promise.mapSeries(
    page1ElementObjects,
    (e) => dispatch(actions.addAnalysisElement(e, page1))
  ))
  .then((elements) => {
    page1Elements = elements;
  })

  .then(() => analysisUtils.fetchAnalysisPage('feature-match-correction'))
  .then(({ elements, ...page }) => {
    page2ElementObjects = elements || [];
    return dispatch(actions.addAnalysisPage({ ...page, enabled: false }));
  })
  .then((page) => {
    page2 = page;
  })

  .then(() => dispatch(actions.enableAnalysisPage(page1)))
  .then(() => dispatch(actions.setAnalysisBusy(false)));

export default main;
