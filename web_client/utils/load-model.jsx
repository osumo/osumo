import { Promise } from './promise';

const loadModel = (id, Model) => (
  new Promise((resolve, reject) => {
    let result = new Model({ _id: id });
    let req = result.fetch();
    req.error((payload) => {
      let e = new Error();
      e.payload = payload;
      reject(e);
    });
    req.then(() => { resolve(result); });
  })
);

export default loadModel;
