import { Router, history } from 'backbone';
import { zip, isFunction } from 'underscore';

const PARSE_PARAM = 0;
const PARSE_IDENTIFIER = 1;

const parseFilter = (filter) => {
  let result = [];
  let parseMode = PARSE_PARAM;
  let parseIndex;
  let filterUsesSpread = false;

  let [i, n] = [0, filter.length];
  for (; i < n; ++i) {
    let chr = filter[i];
    switch (parseMode) {
      case PARSE_PARAM:
        let isColon = (chr === ':');
        let isStar = (chr === '*');
        let isValid = ((isColon || isStar) && !filterUsesSpread);

        if (isValid) {
          parseMode = PARSE_IDENTIFIER;
          parseIndex = i + 1;
          if (isStar) {
            filterUsesSpread = true;
          }
        }

        break;
      case PARSE_IDENTIFIER:
        let firstCharacter = (i === parseIndex);
        let isLower = ('a' <= chr && chr <= 'z');
        let isUpper = ('A' <= chr && chr <= 'Z');
        let isNumeric = ('0' <= chr && chr <= '9');
        let isUnderline = (chr === '_');

        isValid = isLower || isUpper || isUnderline ||
          (isNumeric && !firstCharacter);

        /* handle end of array */
        let index = i;
        if (i === n - 1 && !firstCharacter) {
          isValid = false;
          ++index;
        }

        if (!isValid) {
          if (!firstCharacter) {
            result.push(
              filter.substring(parseIndex, index));
          }

          parseMode = PARSE_PARAM;
        }
        break;
      default:
        /* TODO(opadron): throw an error */
    }
  }

  return result;
};

let historyStarted = false;

let router = () => {
  let router = new Router();
  let counter = 0;

  let options = {};

  function result (...args) {
    let [filter, ...callbacks] = args;
    if (args.length === 0) {
      return result.start();
    }

    if (callbacks.length === 0) {
      return result.navigate(filter);
    } else if (callbacks.length === 1 && !isFunction(callbacks[0])) {
      return result.navigate(filter, callbacks[0]);
    }

    let callbackName = `cb${ counter++ }`;
    let paramList = parseFilter(filter);

    router.route(filter, callbackName);
    return router.on(`route:${ callbackName }`, (...params) => {
      let ctx = {
        params: zip(paramList, params)
        .reduce((partial, [key, value]) => {
          if (key) {
            partial[key] = value;
          }
          return partial;
        }, {})
      };

      let callbackIndex = 0;
      let numCallbacks = callbacks.length;
      let next = () => {
        if (callbackIndex < numCallbacks) {
          let callback = callbacks[callbackIndex++];
          callback(ctx, next);
        }
      };

      next();
    });
  }

  Object.assign(result, {
    start () {
      if (!historyStarted) {
        history.start();
      }
      return historyStarted = true;
    },

    base (value = null) {
      if (value !== null) {
        options.root = value;
      }

      return options.root;
    },

    pushState (value = null) {
      if (value !== null) {
        options.pushState = !!value;
      }

      return options.pushState;
    },

    navigate (route, options = {}, ...args) {
      return router.navigate(
        route, {
          ...{ trigger: true },
          ...options
        },
        ...args);
    },

    route: result
  });

  return result;
};

export { parseFilter, router };
export default router;
