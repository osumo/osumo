import { ajax as _ajax } from 'jquery';
import { Promise } from './promise';

const ajax = (opts) => new Promise((rs, rj) => _ajax(
  Object.assign(opts, {
    success (response, textStatus, jqXHR) {
      rs({ response, textStatus, jqXHR });
    },

    error (jqXHR, textStatus, errorThrown) {
      let error = new Error(errorThrown);
      Object.assign(error, { jqXHR, textStatus });
      rj(error);
    }
  })
));

export default ajax;
