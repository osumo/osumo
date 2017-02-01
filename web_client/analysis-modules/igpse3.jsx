
import analysisUtils from '../utils/analysis';
import { store } from '../globals';

const D = store.dispatch.bind(store);

const main = (survivorPlotFileId) => (
  analysisUtils.fetchAndProcessAnalysisPage(D, {
    key: 'igpse3',
    preprocess: (page) => { page.ui[0].fileId = survivorPlotFileId; }
  })
);

export default main;

