
import actions from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise } from '../utils/promise';
import { store, rest } from '../globals';

import loadModel from '../utils/load-model';

import { formatSize } from 'girder/misc';
import ItemModel from 'girder/models/ItemModel';

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
        ? D(actions.removeAnalysisElement(applyResultElements))
        : null
    )
  ]);

  const state = analysisUtils.aggregateStateData(data, page);

  const task = 'feature-match';
  const inputs = {
    input_path_1: `FILE:${state.input1}`,
    input_path_2: `FILE:${state.input2}`,
    match_spec: `STRING:${state.tabs.computeTab.match_spec}`
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

const applyMatch = (data, page) => {
  const truncatePromise = Promise.all([
    D(actions.truncateAnalysisPages(1, {
      clear: true,
      disable: true,
      remove: false
    })),

    (
      applyResultElements
        ? D(actions.removeAnalysisElement(applyResultElements))
        : null
    )
  ]);

  const state = analysisUtils.aggregateStateData(data, page);

  const metaDataPromise = Promise.all(
    [state.input1, state.input2].map((input) => (
      loadModel(input, ItemModel)
      .then((item) => Object.entries(item.attributes.meta || {}))
    ))
  );

  const task = 'feature-apply';
  const inputs = {
    input_path_1: `FILE:${state.input1}`,
    input_path_2: `FILE:${state.input2}`,
    match_json: `FILE:${state.tabs.applyTab.featureMatch}`
  };
  let outputs = {};
  const title = 'feature-apply';
  const maxPolls = 40;

  const runPromise = (
    D(actions.ensureScratchDirectory())

    .then((dir) => {
      const prefix = `FILE:${dir.attributes._id}`;
      const { states } = data;
      outputs.output_path_1 = `${prefix}:${states[page.elements[0]].name}`;
      outputs.output_path_2 = `${prefix}:${states[page.elements[1]].name}`;
    })

    .then(() => (
      analysisUtils.runTask(task, { inputs, outputs }, { title, maxPolls })
    ))

    .then(
      ({
        output_path_1: { itemId: outputId1 },
        output_path_2: { itemId: outputId2 }
      }) => ({
        outputId1,
        outputId2
      })
    )
  );

  return (
    Promise.all([
      truncatePromise,
      metaDataPromise,
      runPromise
    ])

    .then(([, meta, result]) => {
      let { outputId1, outputId2 } = result;
      return (
        Promise.all([
          loadModel(outputId1, ItemModel),
          loadModel(outputId2, ItemModel)
        ])

        .then((items) => (
          Promise.all(
            items.map((item, i) => (
              Promise.mapSeries(
                meta[i],
                ([k, v]) => new Promise((resolve, reject) => {
                  item.addMetadata(
                    k, v, () => resolve(),
                    ({ message }) => reject(new Error(message))
                  )
                })
              )
            ))
          )

          .then(() => Promise.mapSeries(
            items,
            (item) => D(actions.addAnalysisElement(
              {
                type: 'girderItem',
                downloadUrl: item.downloadUrl(),
                inlineUrl: item.downloadUrl({ contentDisposition: 'inline' }),
                name: item.name(),
                size: formatSize(item.get('size'))
              },
              applyTabElement
            ))
          ))
        ))

        .then((elements) => { applyResultElements = elements; })
      )
    })
  );
};

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
