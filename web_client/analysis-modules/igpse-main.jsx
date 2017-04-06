
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store } from '../globals';

import igpseInput from './igpse-input';

const D = store.dispatch.bind(store);

let pages = {};
let elementObjects = {};
let elements = {};

const processPage = (pageKey, payloadKey) => (
  analysisUtils.fetchAnalysisPage(pageKey)

  .then(({ elements, ...page }) => {
    elementObjects[payloadKey] = elements || [];
    return D(actions.addAnalysisPage({ ...page, enabled: false }));
  })

  .then((page) => (pages[payloadKey] = page))
);

const main = () => (
  Promise.resolve()

  .then(() => processPage('igpse-input', 'input'))
  .then(() => processPage('igpse-feature-selection', 'featureSelection'))
  .then(() => processPage('igpse-subset-selection', 'subsetSelection'))
  .then(() => processPage('igpse-survival-plot', 'survivalPlot'))
  .then(() => ({
    pages,
    elements,
    elementObjects,
    index: 0
  }))

  .then(igpseInput)
);

export default main;
