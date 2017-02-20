
import analysisUtils from '../utils/analysis';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => (
  analysisUtils.fetchAndProcessAnalysisPage(
    D, {
      key: 'surv2',
      preprocess: (page) => {
        page.ui[0].fileId = data.dataplotId;
      }
    }
  )
);

export default main;

