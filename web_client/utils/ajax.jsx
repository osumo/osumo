import { ajax as _ajax } from 'jquery';
import { Promise } from './promise';

const ajax = (opts) => new Promise((resolve, reject) => _ajax(
  Object.assign(opts, {
    success (response, textStatus, jqXHR) {
      resolve({ response, textStatus, jqXHR });
    },

    error (jqXHR, textStatus, errorThrown) {
      let error = new Error(errorThrown);
      Object.assign(error, { jqXHR, textStatus });
      reject(error);
    }
  })
));

export default ajax;
