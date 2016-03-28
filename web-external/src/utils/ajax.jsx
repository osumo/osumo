import { ajax as _ajax } from 'jquery';
import { Promise } from './promise';

const ajax = (opts) => new Promise((rs, rj) => _ajax(
  Object.assign(opts, {
    success (response, textStatus, jqXHR) {
      rs({ response, textStatus, jqXHR });
    },

    error (jqXHR, textStatus, errorThrown) {
      rj({ jqXHR, textStatus, errorThrown });
    }
  })
));

export default ajax;
