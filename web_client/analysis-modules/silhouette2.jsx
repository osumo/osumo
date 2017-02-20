
import analysisUtils from '../utils/analysis';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (data) => (
  analysisUtils.fetchAndProcessAnalysisPage(
    D, {
      key: 'silhouette2',
      preprocess: (page) => {
        page.ui[0].fileId = data.dataplot1Id;
        page.ui[1].fileId = data.dataplot2Id;
      }
    }
  )
);

export default main;

