
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';
import igpseFeatureSelection from './igpse-feature-selection';

const D = store.dispatch.bind(store);

let payload;

const actionProcess = (data, page) => {
  const truncatePromise = D(actions.truncateAnalysisPages(
    payload.index + 1,
    {
      clear: true,
      disable: true,
      remove: false
    }
  ));

  const state = analysisUtils.aggregateStateData(data, page);

  payload.mrnaInputId = state.mrnaInputId;
  payload.mirnaInputId = state.mirnaInputId;
  payload.clinicalInputId = state.clinicalInputId;

  const task = 'feature-extract';
  const inputs = {
    input_path_1: `FILE:${state.mrnaInputId}`,
    input_path_2: `FILE:${state.mirnaInputId}`
  };
  const outputs = { extract_result: 'JSON' };
  const title = 'iGPSe Feature Extraction';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })
    .then(
      ({ extract_result }) => (payload.extract_result = extract_result.data)
    )
    .then(() => ({
      ...payload,
      index: payload.index + 1
    }))
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then(igpseFeatureSelection)
  );
};

const main = (data) => (
  Promise.resolve(payload = data)

  .then(() => (
    D(actions.registerAnalysisAction(
      payload.pages.input, 'process', actionProcess
    ))
  ))

  .then(() => Promise.mapSeries(
    payload.elementObjects.input,
    (element) => D(actions.addAnalysisElement(element, payload.pages.input))
  ))

  .then((elements) => (payload.elements.input = elements))

  .then(() => D(actions.enableAnalysisPage(payload.pages.input)))

  // .then(() => Promise.all([
  //   D(actions.populateFileSelectionElement(
  //     payload.elements.input[0], '58daec3688628a186899d664'
  //   )),

  //   D(actions.populateFileSelectionElement(
  //     payload.elements.input[1], '58daec3488628a186899d648'
  //   )),

  //   D(actions.populateFileSelectionElement(
  //     payload.elements.input[2], '58daec3488628a186899d63f'
  //   ))
  // ]))

  // .delay(100)

  // .then(() => D(actions.triggerAnalysisAction({
  //   page: payload.pages.input,
  //   action: 'process'
  // })))
);

export default main;
