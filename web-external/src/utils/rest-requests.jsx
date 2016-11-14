import { search as searchCookies } from './cookie';
import ajax from './ajax';

const restRequests = ({
  events,
  apiRoot
}) => {
  /**
   * Make a request to the REST API. Bind a 'done' handler to the return
   * value that will be called when the response is successful. To bind a
   * custom error handler, bind an 'error' handler to the return promise,
   * which will be executed in addition to the normal behavior of logging
   * the error to the console. To override the default error handling
   * behavior, pass an 'error' key in your opts object; this should be done
   * any time the server might throw an exception from validating user input,
   * e.g. logging in, registering, or generally filling out forms.
   *
   * @param path The resource path, e.g. 'user/login'
   * @param data The form parameter object.
   * @param [type='GET'] The HTTP method to invoke.
   * @param [girderToken] An alternative auth token to use for this request.
   */
  let result = (opts) => {
    opts = opts || {};
    let defaults = { dataType: 'json', type: 'GET' };
    if (opts.path.substring(0, 1) !== '/') {
      opts.path = '/' + opts.path;
    }
    opts.url = apiRoot + opts.path;

    opts = Object.assign({}, defaults, opts);

    var token = opts.girderToken || result.currentToken ||
      searchCookies('girderToken');

    if (token) {
      opts.headers = opts.headers || {};
      opts.headers['Girder-Token'] = token;
    }
    let ajaxObj = (
      ajax(opts)
      .catch(({ jqXHR: error, textStatus: status }) => {
        let info;
        if (error.status === 401) {
          events.trigger('g:loginUi');
          info = {
            text: 'You must log in to view this resource',
            type: 'warning',
            timeout: 4000,
            icon: 'info'
          };
        } else if (error.status === 403) {
          info = {
            text: 'Access denied. See the console for more details.',
            type: 'danger',
            timeout: 5000,
            icon: 'attention'
          };
        } else if (error.status === 0 && error.statusText === 'abort') {
          /* We expected this abort, so do nothing. */
          return;
        } else if (error.status === 500 && error.responseJSON &&
                   error.responseJSON.type === 'girder') {
          info = {
            text: error.responseJSON.message,
            type: 'warning',
            timeout: 5000,
            icon: 'info'
          };
        } else if (status === 'parsererror') {
          info = {
            text: 'A parser error occurred while communicating with the ' +
              'server (did you use the correct value for `dataType`?). ' +
                'Details have been logged in the console.',
            type: 'danger',
            timeout: 5000,
            icon: 'attention'
          };
        } else {
          info = {
            text: 'An error occurred while communicating with the ' +
              'server. Details have been logged in the console.',
            type: 'danger',
            timeout: 5000,
            icon: 'attention'
          };
        }
        events.trigger('g:alert', info);
        return error;
      })
    );

    ajaxObj.abort = function () {
      if (this.isCancellable()) {
        this.cancel();
      }
    };
    return ajaxObj;
  };

  Object.assign(result, {
    /**
     * Log in to the server. If successful, sets the value of
     * girder.currentUser and girder.currentToken and triggers the 'g:login'
     * and 'g:login.success'.  On failure, triggers the 'g:login.error'
     * event.
     *
     * @param username The username or email to login as.
     * @param password The password to use.
     * @param cors If the girder server is on a different origin, set this
     *        to 'true' to save the auth cookie on the current domain.
     *        Alternatively, you may set the global option
     *        'girder.corsAuth = true'.
     */
    login (username, password, cors) {
      var auth = 'Basic ' + window.btoa(username + ':' + password);
      if (cors === undefined) {
        cors = result.corsAuth;
      }

      return result({
        method: 'GET',
        path: '/user/authentication',
        headers: {
          'Girder-Authorization': auth
        }
      }).then(({ response }) => {
        response.user.token = response.authToken;

        result.currentUser = response.user;
        result.currentToken = response.user.token.token;

        if (cors && !searchCookies('girderToken')) {
          // For cross-origin requests, we should write the token into
          // this document's cookie also.
          document.cookie = 'girderToken=' + result.currentToken;
        }

        events.trigger('g:login.success', response.user);
        events.trigger('g:login', response);

        return response.user;
      }).catch((jqXHR) => {
        events.trigger('g:login.error', jqXHR.status, jqXHR);
        return jqXHR;
      });
    },

    logout () {
      return result({
        method: 'DELETE',
        path: '/user/authentication'
      }).then(() => {
        result.currentUser = null;
        result.currentToken = null;

        events.trigger('g:login', null);
        events.trigger('g:logout.success');
      }).catch((jqXHR) => {
        events.trigger('g:logout.error', jqXHR.status, jqXHR);
        return jqXHR;
      });
    },

    fetchCurrentUser () {
      return result({
        method: 'GET',
        path: '/user/me'
      }).then(({ response }) => response);
    },

    restRequest: result
  });

  return result;
};

export default restRequests;
