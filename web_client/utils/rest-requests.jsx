import { restRequest } from 'girder/rest';
import { login, logout } from 'girder/auth';
import { Promise } from './promise';

const restRequests = (...args) => {
  const wrap = (response, status, jqXHR) => ({
    response,
    status,
    jqXHR
  });

  return new Promise(
    (resolve, reject) => restRequest(...args)
      .then((...a) => resolve(wrap(...a)), reject)
  );
};

restRequests.login = (...args) => {
  return new Promise(
    (resolve, reject) => login(...args).then(resolve, reject)
  );
};

restRequests.anonLogin = () => restRequests({
  path: 'osumo/anonlogin',
  method: 'POST'
});

restRequests.logout = (...args) => {
  return new Promise(
    (resolve, reject) => logout(...args).then(resolve, reject)
  );
};

export default restRequests;
