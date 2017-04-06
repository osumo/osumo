import { isArray, isString, isUndefined } from 'lodash';

import { rest, store } from '../globals';
import objectReduce from './object-reduce';
import { Promise } from './promise';
import actions from '../actions';

const aggregateStateDataHelper = (data, obj, cache={}) => {
  let { objects, states } = data;
  objects = objects || {};
  states = states || {};

  /*
   * cache entries are length-1-arrays.  This lets us
   * box/unbox undefined and null values
   */
  if (!isArray(cache[obj.id])) {
    let { elements } = obj;
    elements = elements || [];

    let state = states[obj.id];
    state = state || {};
    let { value } = state;

    let result;
    /*
     * If this node is a leaf node, then get its "value" directly from its state
     * hash
     */
    if (elements.length === 0) {
      result = value;

    /*
     * Otherwise, this node has child nodes, then its "value" is a hash of its
     * childrens' values.
     */
    } else {
      result = {};

      /*
       * ...but if this node *also* has its own "value", set it under the
       * "parent-value" key.  Something like "parent-value" is chosen because it
       * is not a valid identifier, and should be less likely to clash with any
       * child key.
       */
      if (!isUndefined(value)) {
        result['parent-value'] = value;
      }
    }

    /*
     * save result object in cache *now*, even if its supposed to be a hash of
     * its children and we haven't finished populating it, yet.  This is done so
     * that it is available for recursive calls.  Because the values are passed
     * by reference, this will work correctly even if there is a reference
     * cycle.
     */
    /* box the cached entry */
    cache[obj.id] = [result];

    (
      elements
        .filter((id) => id in objects)
        .map((id) => objects[id])
        .forEach((e) => {
          let { key } = e;
          key = key || `anon-${e.id}`;

          let value = aggregateStateDataHelper(data, e, cache);
          if (!isUndefined(value)) {
            result[key] = value;
          }
        })
    );
  }

  /* unbox the cached entry */
  return cache[obj.id][0];
};

export const aggregateStateData = (data, page) => (
  aggregateStateDataHelper(data, page)
);

export const pollJob = (
  jobId, title, taskName, pollInterval, pollCounter, maxPolls
) => (
  Promise.delay(pollInterval)
    .then(() => rest({ path: `osumo/results/${jobId}` }))
    .then(({ response: { status, results } }) => {
      if (status === 4) {  /* error */
        throw new Error(
          `OSUMO task "${title}" (${taskName}/${jobId})` +
          ' failed with an error'
        );
      } else if (status === 5) {  /* canceled */
        throw new Error(
          `OSUMO task "${title}" (${taskName}/${jobId}) was canceled`
        );
      } else if (status === 3) {  /* success */
        return results;
      }

      if (maxPolls > 0) {
        if (pollCounter === maxPolls) {  /* no more polls */
          throw new Error(
            `OSUMO task "${title}" (${taskName}/${jobId}) ` +
            `timed out after ${maxPolls} tr${maxPolls > 1 ? 'ies' : 'y'}`
          );
        }

        ++pollCounter;
      }

      return pollJob(
        jobId, title, taskName, pollInterval, pollCounter, maxPolls);
    })
);

export const runTask = (taskName, params, options = {}) => {
  let { maxPolls, pollInterval, title } = options;
  if (isUndefined(pollInterval)) { pollInterval = 5000; }
  if (isUndefined(maxPolls)) { maxPolls = 0; }

  let path = `osumo/task/${taskName}/run`;
  if (!isUndefined(title)) {
    path = `${path}?title=${title}`;
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
      .map(([t, k, v]) => ([`${t}(${k})`, v]))
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

export const traverseAnalysisElements = (obj, visitor) => {
  let { analysis: { objects } } = store.getState();
  let traversedMap = {};

  let done = false;
  const doneCallback = () => (done = true);
  let { id } = obj;
  if (isUndefined(id)) { id = obj; }
  obj = objects[id] || {};

  const processBreadth = (idList) => {
    if (done || idList.length === 0) { return; }
    let newIdList = [];
    return (
      Promise.all(
        idList
          .filter((id) => (!traversedMap[id]))
          .map((id) => {
            let obj = objects[id] || {};
            traversedMap[id] = true;

            let { elements: newElements } = obj;
            newElements = newElements || [];
            newIdList = newIdList.concat(newElements);
            return visitor(obj, doneCallback);
          })
      )

      .then(() => processBreadth(newIdList))
    );
  };

  return processBreadth(obj.elements || []);
};

export const fetchAnalysisPage = (key) => {
  const path = `osumo/ui/${key}`;
  return rest({ path }).then(({ response }) => response);
};

export default {
  aggregateStateData,
  fetchAnalysisPage,
  pollJob,
  runTask,
  traverseAnalysisElements
};
