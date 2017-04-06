
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store, rest } from '../globals';

import { formatSize } from 'girder/misc';

const D = store.dispatch.bind(store);

let page1;
let computeResultElement;
let applyResultElements;
let tabGroupElement;
let computeTabElement;
let applyTabElement;
let matchChooserElement;

const computeMatch = (data, page) => {
  const truncatePromise = Promise.all([
    D(actions.truncateAnalysisPages(1, {
      clear: true,
      disable: true,
      remove: false
    })),

    (
      computeResultElement
        ? D(actions.removeAnalysisElement(computeResultElement))
        : null
    ),

    (
      applyResultElements
        ? Promise.all(
          applyResultElements
            .filter((x) => x)
            .map((e) => D(actions.removeAnalysisElement(e)))
        )
        : null
    )
  ]);

  const state = analysisUtils.aggregateStateData(data, page);

  const task = 'feature-match';
  const inputs = {
    input_path_1: `FILE:${state.input1}`,
    input_path_2: `FILE:${state.input2}`,
    matches: `STRING:${state.tabs.computeTab.matches}`
  };
  const outputs = { match_result: 'JSON' };
  const title = 'feature-match';
  const maxPolls = 40;

  const runPromise = (
    analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })

    .then(({ match_result: { data: result } }) => result)
  );

  return (
    Promise.all([truncatePromise, runPromise])
    .then(([, result]) => result)
    .then((result) => {
      console.log('MATCH RESULTS!');
      Object.entries(result).forEach(([k, v]) => {
        console.log('==========')
        console.log(k);
        console.log('==========')
        console.log(`SCORE: ${v.score}`);
        v.assignments.forEach(({ pair, score }) => {
          console.log([
            `    (${pair[0].index}) ${pair[0].value}`,
            `    (${pair[1].index}) ${pair[1].value}`,
            `    ${score}`,
            '\n'
          ].join('\n'));
        });
      });
      console.log(result);

      return (
        D(actions.uploadFile(
          {
            name: 'feature-match.json',
            contents: JSON.stringify(result, null, 2),
            type: 'application/json'
          },
          {
            metaData: [
              ['sumoFileType', 'featureMatch']
            ]
          }
        ))

        .then(({ item }) => Promise.all([
          D(actions.addAnalysisElement(
            {
              type: 'girderItem',
              downloadUrl: item.downloadUrl(),
              inlineUrl: item.downloadUrl({ contentDisposition: 'inline' }),
              name: item.name(),
              size: formatSize(item.get('size'))
            },
            computeTabElement
          )),

          D(actions.populateFileSelectionElement(
            matchChooserElement, item.attributes
          ))
        ]))

        .then(([e]) => { computeResultElement = e; })
      );
    })
  );
};

const applyMatch = (data, page) => { /* TODO(opadron): */ };

const main = () => (
  Promise.resolve()

  .then(() => D(actions.registerAnalysisAction(
    'feature-match', 'computeMatch', computeMatch))
  )

  .then(() => D(actions.registerAnalysisAction(
    'feature-match', 'applyMatch', applyMatch))
  )

  .then(() => analysisUtils.fetchAnalysisPage('feature-match'))

  .then((page) => {
    let tabGroup = page.elements[2];
    page.elements = page.elements.slice(0, 2);

    let [computeTab, applyTab] = tabGroup.elements;
    delete tabGroup.elements;

    let applyTabElements = applyTab.elements;
    delete applyTab.elements;

    return (
      D(actions.addAnalysisPage({ ...page, enabled: false }))

      .then((page) => (page1 = page))

      .then(() => D(actions.addAnalysisElement(tabGroup, page1)))
      .then((e) => (tabGroupElement = e))

      .then(() => D(actions.addAnalysisElement(computeTab, tabGroupElement)))
      .then((e) => (computeTabElement = e))

      .then(() => D(actions.addAnalysisElement(applyTab, tabGroupElement)))
      .then((e) => (applyTabElement = e))

      .then(() => Promise.mapSeries(
        applyTabElements,
        (e) => D(actions.addAnalysisElement(e, applyTabElement))
      ))
      .then(([e]) => (matchChooserElement = e))
    );
  })

  .then(() => D(actions.enableAnalysisPage(page1)))
);

export default main;
