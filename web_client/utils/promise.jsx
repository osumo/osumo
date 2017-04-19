import { Promise } from 'bluebird';
import scatter from './scatter';

export { Promise };

export const SCHEDULES = {
  DYNAMIC: 'dynamic',
  ROUND: 'round',
  STATIC: 'static'
};

export const map = (args) => {
  let {
    array,
    factor,
    mapper,
    schedule
  } = args;

  factor = factor || 1;
  schedule = schedule || SCHEDULES.STATIC;

  /* run sequentially: in this case, there's no difference between schedules */
  if (factor === 1) {
    return Promise.mapSeries(
      array,
      (value, index) => mapper(value, index, array, 0, factor)
    );
  }

  /*
   * dynamic scheduling: elements are processed by promise chains as they
   *                     complete previously processed elements.  The chains
   *                     race amongst themselves to determine which chains
   *                     process which elements.
   */
  if (schedule === 'dynamic') {
    return new Promise((resolve, reject) => {
      let index = 0;
      let remainingChains = factor;
      let resultArray = new Array(array.length);
      let promiseArray = new Array(factor).fill(Promise.resolve());

      const nextStep = (pIndex) => {
        let i = index++;
        if (i >= array.length) {
          --remainingChains;
          if (remainingChains <= 0) {
            Promise.all(resultArray).then(resolve).catch(reject);
          }
        } else {
          resultArray[i] = Promise.resolve().then(
            () => mapper(array[i], i, array, pIndex, factor)
          );

          promiseArray[pIndex] = (
            promiseArray[pIndex]
              .then(() => resultArray[i])
              .then(() => nextStep(pIndex))
          );
        }

        /*
         * bluebird tries to help us here by issuing a warning, because it looks
         * like we're creating run-away promise chains.  In reality, this
         * promise usage pattern is just really complex.
         *
         * We make sure to return null to reassure bluebird that we know what
         * we're doing.
         */
        return null;
      };

      new Array(factor).fill(null).forEach((_, i) => nextStep(i));
    });
  } else {
    let isRoundSchedule = (schedule === 'round');

    if (!isRoundSchedule && schedule !== 'static') {
      throw new Error(`Unrecognized concurrency schedule: ${schedule}`);
    }

    /*
     * handles both static and round scheduling.
     *
     * static: The i'th chain is given the i'th set of ~B elements.
     *         B is the greatest integer such that B <= array_length/factor
     *
     *     example: [0, 0, 0, 0, 1, 1, 1, 2, 2, 2]
     *
     * round: Like static, but the element assignments are interleaved, making
     *        the assignment a round-robin.  The first factor elements are
     *        assigned sequentially to each chain, then the next factor elements
     *        are similarly assigned, and so on.
     *
     *     example: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0]
     *
     */
    return Promise.all(
      scatter(
        array.map((value, index) => [value, index]),
        factor,
        isRoundSchedule
      ).map((chunk, pIndex) => (
        Promise.mapSeries(
          chunk,
          ([value, index]) => mapper(value, index, array, pIndex, factor)
        )
      ))
    ).reduce((a, b) => a.concat(b), []);
  }
};

export const semaphore = (callback) => {
  let counter = 0;
  let locked = false;
  let value;

  return new Promise((resolve, reject) => {
    const increment = (v) => {
      if (locked) { return; }
      ++counter;
      value = v;
    };

    const decrement = () => {
      if (locked) {
        return;
      }

      locked = (--counter <= 0);

      if (counter < 0) {
        reject(new Error('decrement called without matching increment'));
      }

      if (locked) {
        resolve(value);
      }
    };

    callback(increment, decrement);
  });
};

export const delayedSemaphore = (callback, delay) => semaphore((inc, dec) => {
  const newInc = (value) => (
    Promise.resolve(value).then(inc).delay(delay).then(dec)
  );

  callback(newInc);
});

export default Promise;
