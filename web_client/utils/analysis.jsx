import { isString, isUndefined } from 'lodash';

import { rest } from '../globals';
import objectReduce from './object-reduce';
import { Promise } from './promise';
import actions from '../actions';

export const aggregateForm = (forms, page) => (
  (page.elements || [])
    .map(({ key }) => key)
    .filter((key) => !isUndefined(key))
    .map((key) => [
      key,
      (
        (
          forms[page.key] || {}
        )[key] || {}
      ).value
    ])
    .reduce(objectReduce, {})
);

export const pollJob = (
  jobId, title, taskName, pollInterval, pollCounter, maxPolls
) => (
  Promise.delay(pollInterval)
    .then(() => rest({ path: `osumo/results/${ jobId }` }))
    .then(({ response: { status, files } }) => {
      if (status === 4) {  /* error */
        throw new Error(
          `OSUMO task "${ title }" (${ taskName }/${ jobId })` +
          ' failed with an error'
        );
      } else if (status === 5) {  /* canceled */
        throw new Error(
          `OSUMO task "${ title }" (${ taskName }/${ jobId }) was canceled`
        );
      } else if (status === 3) {  /* success */
        return files;
      }

      if (maxPolls > 0) {
        if (pollCounter === maxPolls) {  /* no more polls */
          throw new Error(
            `OSUMO task "${ title }" (${ taskName }/${ jobId }) ` +
            `timed out after ${ maxPolls } tr${ maxPolls > 1 ? 'ies' : 'y' }`
          );
        }

        ++pollCounter;
      }

      return pollJob(jobId, title, taskName, pollCounter, pollInterval);
    })
);

export const runTask = (taskName, params, options={}) => {
  let { maxPolls, pollInterval, title } = options;
  if (isUndefined(pollInterval)) { pollInterval = 5000; }
  if (isUndefined(maxPolls)) { maxPolls = 0; }

  let path = `osumo/task/${ taskName }/run`
  if (!isUndefined(title)) {
    path = `${ path }?title=${ title }`;
    title = 'untitled';
  }

  let { inputs, outputs } = params;
  inputs = inputs || {};
  outputs = outputs || {};

  let data = (
    Object.entries(inputs)
      .map(([k, v]) => (['INPUT', k, v]))
      .concat(
        Object.entries(outputs)
          .map(([k, v]) => (['OUTPUT', k, v]))
      )
      .map(([t, k, v]) => ([`${ t }(${ k })`, v]))
      .reduce(objectReduce, {})
  );

  return (
    rest({ path, type: 'POST', data })
      .then(({
        response: {
          job: { _id: id }
        }
      }) => pollJob(id, title, taskName, pollInterval, 0, maxPolls))
  );
};

const {
  addAnalysisElement: addElem,
  addAnalysisPage: addPage
} = actions;

export const processAnalysisPage = (dispatch, params) => {
  let { ui: uiSpec, postprocess } = params;
  let { ui, tags, ...pageData } = uiSpec;

  let parent;
  let promiseChain = dispatch(addPage(pageData));
  if (postprocess) {
    promiseChain = promiseChain.then(
      (p) => (
        Promise.resolve(postprocess('page', p)).then(
          (newP) => (newP ? newP : p)
        )
      )
    );
  }

  promiseChain = promiseChain.then((p) => parent = p);

  ui.forEach((elem) => {
    promiseChain = promiseChain.then(() => dispatch(addElem(elem, parent)));

    if (postprocess) {
      promiseChain = promiseChain.then(
        (elem) => (
          Promise.resolve(postprocess('element', elem)).then(
            (newElem) => (newElem ? newElem : elem)
          )
        )
      );
    }
  });

  return promiseChain;
};

export const fetchAndProcessAnalysisPage = (dispatch, params) => {
  if (isString(params)) {
    params = { key: params };
  }

  let {
    key,
    index,
    preprocess,
    postprocess
  } = params;

  let path = [`osumo/ui/${ key }`];
  if (!isUndefined(index)) {
    path.push(`index=${ index }`);
  }

  path = path.join('?');

  let promiseChain = rest({ path }).then(({ response }) => response);
  if (!isUndefined(preprocess)) {
    promiseChain = promiseChain.then(
      (ui) => (
        Promise.resolve(preprocess(ui)).then(
          (newUI) => (newUI ? newUI : ui)
        )
      )
    );
  }

  promiseChain = promiseChain.then((ui) => processAnalysisPage(dispatch, {
    ui, postprocess
  }));

  return promiseChain;
};

export default {
  aggregateForm,
  fetchAndProcessAnalysisPage,
  pollJob,
  processAnalysisPage,
  runTask
};
