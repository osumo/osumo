
import ItemModel from 'girder/models/ItemModel';

import actions, { addItemMetadata } from '../actions';
import analysisUtils from '../utils/analysis';
import { Promise, delayedSemaphore } from '../utils/promise';
import { store } from '../globals';
import loadModel from '../utils/load-model';

const workflowTable = {
  input: require('./igpse-input'),
  featureSelection: require('./igpse-feature-selection'),
  subsetSelection: require('./igpse-subset-selection'),
  subsetSelectionB: require('./igpse-subset-selection-b'),
  survivalPlot: require('./igpse-survival-plot')
};

const D = store.dispatch.bind(store);

const noop = () => {};

export class IGPSEWorkflow {
  constructor() {
    this.elementObjects = {};
    this.elements = {};
    this.pages = {};
    this.index = 0;

    this.workflowTableCache = {};

    this.constructPromise = Promise.mapSeries(
      [
        ['igpse-input'             , 'input'           , true , true],
        ['igpse-feature-selection' , 'featureSelection', true , true],
        ['igpse-subset-selection-a', 'subsetSelection' , true , true],
        ['igpse-subset-selection-b', 'subsetSelectionB', false, true],
        ['igpse-survival-plot'     , 'survivalPlot'    , true , true]
      ],
      (args) => this.processPage(...args)
    );

    window.G = this;
  }

  processPage(pageKey, attrName, addPage=true, construct=false) {
    return (
      (
        construct ? Promise.resolve() : this.constructPromise
      )

      .then(() => analysisUtils.fetchAnalysisPage(pageKey))

      .then(({ elements, ...page }) => Promise.all([
        elements || [],
        addPage
          ? D(actions.addAnalysisPage({ ...page, enabled: false }))
          : null
      ]))

      .then(([e, p]) => {
        this.elementObjects[attrName] = e;
        if (p) { this.pages[attrName] = p; }
      })
    )
  }

  runWorkflowStep(key) {
    let result = this.workflowTableCache[key];
    if (!result) {
      let func = workflowTable[key];
      if (func) {
        result = () => (func.default(this));
      } else {
        result = noop;
      }

      this.workflowTableCache[key] = result;
    }

    return result;
  }

  registerAction(key, action) {
    let actionCallback = this[`_action_${key}_${action}`].bind(this);
    return (
      this.constructPromise

      .then(() => this.pages[key])

      .then((page) => (
        D(actions.registerAnalysisAction(page, action, actionCallback))
      ))
    );
  }

  triggerAction(key, action) {
    return (
      this.constructPromise

      .then(() => (
        D(actions.triggerAnalysisAction({
          page: this.pages[key],
          action
        }))
      ))
    );
  }

  renderElements(elementKey, pageKey=null) {
    pageKey = pageKey || elementKey;

    return (
      this.constructPromise

      .then(() => (
        Promise.mapSeries(
          this.elementObjects[elementKey] || [],
          (e) => D(actions.addAnalysisElement(e, this.pages[pageKey]))
        )
      ))

      .then((elements) => {this.elements[elementKey] = elements;})
    );
  }

  enablePage(key) {
    return (
      this.constructPromise

      .then(() => D(actions.enableAnalysisPage(this.pages[key])))
    );
  }

  switchPage(key) {
    return (
      this.constructPromise

      .then(() => D(actions.setCurrentAnalysisPage(this.pages[key])))
    );
  }

  _action_input_process(data, page) {
    let state;
    this.index = 0;
    return (
      this.constructPromise

      .then(() => {
        state = analysisUtils.aggregateStateData(data, page);

        this.mrnaInputId = state.mrnaInputId;
        this.mirnaInputId = state.mirnaInputId;
        this.clinicalInputId = state.clinicalInputId;
      })

      .then(() => (
        Promise.all([
          this.truncatePages(),
          this.runFeatureExtractJobs(state)
        ])
      ))

      .then(() => { ++this.index; })

      .then(this.runWorkflowStep('featureSelection'))
    );
  }

  _action_featureSelection_process(data, page) {
    let state;
    this.index = 1;
    return (
      this.constructPromise

      .then(() => {
        state = analysisUtils.aggregateStateData(data, page);

        this.mrnaFeatures = state.mrnaFeatures;
        this.mirnaFeatures = state.mirnaFeatures;
      })

      .then(() => (
        Promise.all([
          this.truncatePages(),
          this.runFeatureSliceJobs(state)
        ])
      ))
      .then(() => { ++this.index; })
      .then(this.runWorkflowStep('subsetSelection'))
    );
  }

  _action_subsetSelection_cluster(data, page) {
    let state;
    this.index = 2;
    return (
      this.constructPromise

      .then(() => {
        state = analysisUtils.aggregateStateData(data, page);

        this.mrnaClusters = state.mrnaClusters;
        this.mirnaClusters = state.mirnaClusters;
      })

      .then(() => (
        Promise.all([
          this.truncatePages(),
          (
            this.elements.subsetSelectionB

              ? D(actions.removeAnalysisElement(
                  this.elements.subsetSelectionB
                ))

              : null
          ),
          this.runSubsetClusterJob(state)
        ])
      ))

      .then(() => {
        let sss = this.elementObjects.subsetSelectionB;
        sss[0].elements[0].fileId = this.mrnaMapId;
        sss[0].elements[1].fileId = this.mirnaMapId;
        sss[1].inputData = this.clusterData;
      })

      .then(this.runWorkflowStep('subsetSelectionB'))
    );
  }

  _action_subsetSelection_process(data, page) {
    let state;
    this.index = 2;
    return (
      this.constructPromise

      .then(() => {
        state = analysisUtils.aggregateStateData(data, page);
        this.parallelSets = state.pSets;
      })

      .then(() => (
        Promise.all([
          this.truncatePages(),
          this.runSubsetProcessJob(state)
        ])
      ))

      .then(() => {
        this.elementObjects.survivalPlot[0].fileId = this.survivalPlotId;
      })

      .then(() => { ++this.index; })
      .then(this.runWorkflowStep('survivalPlot'))
    );
  }

  truncatePages() {
    return (
      this.constructPromise

      .then(() => (
        D(actions.truncateAnalysisPages(
          this.index + 1,
          { clear: true, disable: true, remove: false }
        ))
      ))
    );
  }

  runFeatureExtractJobs(state) {
    return (
      this.constructPromise

      .then(() => {
        const task = 'feature-extract';
        const inputs = {
          single_mode: 'BOOLEAN:1',
          extract_columns: 'BOOLEAN:0',
          input_path_2: 'STRING:null'
        };
        const outputs = { extract_result: 'JSON' };
        const title = 'iGPSe Feature Extraction';
        const maxPolls = 40;

        const run = (inputId, key) => {
          let newInputs = {
            ...inputs,
            input_path_1: `FILE:${inputId}`
          };

          return analysisUtils.runTask(
            task,
            { inputs: newInputs, outputs },
            { title, maxPolls }
          ).then(({ extract_result }) => (this[key] = extract_result.data));
        };

        return (
          Promise.all([
            run(state.mrnaInputId , 'mrnaExtractResult' ),
            run(state.mirnaInputId, 'mirnaExtractResult')
          ])
        );
      })
    );
  }

  runFeatureSliceJobs(state) {
    return (
      this.constructPromise

      .then(() => D(actions.ensureScratchDirectory()))

      .then(({ attributes: { _id: id } }) => {
        this.scratchDirectoryId = id;
      })

      .then(() => {
        const task = 'feature-slice';
        const _inputs = { slice_columns: 'BOOLEAN:0' };
        const title = 'iGPSe Feature Slice';
        const maxPolls = 40;

        const run = (inputId, features, key) => {
          if (!features || features.length === 0) {
            this[key] = inputId;
            return;
          }

          let inputs = {
            ..._inputs,
            input_path: `ITEM:${inputId}`,
            selections: `STRING:${JSON.stringify(features)}`,
          };

          return (
            loadModel(inputId, ItemModel)

            .then((item) => {
              let outputs = {
                sliced_output: [
                  'FILE',
                  this.scratchDirectoryId,
                  `sliced-${item.name()}`
                ].join(':')
              };

              let metaData = Object.entries(item.attributes.meta || {});

              return (
                analysisUtils.runTask(
                  task, { inputs, outputs }, { title, maxPolls }
                )

                .then(({ sliced_output }) => {
                  this[key] = sliced_output.itemId;

                  return (
                    loadModel(this[key], ItemModel)
                    .then((item) => addItemMetadata(item, metaData))
                  );
                })
              );
            })
          )
        };

        return (
          Promise.mapSeries(
            [
              [this.mrnaInputId , this.mrnaFeatures , 'slicedMrnaInputId' ],
              [this.mirnaInputId, this.mirnaFeatures, 'slicedMirnaInputId']
            ],
            (args) => run(...args)
          )
        );
      })
    );
  }

  runSubsetClusterJob(state) {
    return (
      this.constructPromise

      .then(() => {
        const task = 'iGPSe';
        const inputs = {
          mrna_input_path: `ITEM:${this.slicedMrnaInputId}`,
          mirna_input_path: `ITEM:${this.slicedMirnaInputId}`,
          clinical_input_path: `ITEM:${this.clinicalInputId}`,
          mrna_clusters: `INTEGER:${this.mrnaClusters}`,
          mirna_clusters: `INTEGER:${this.mirnaClusters}`
        };
        let outputs = { clustersJSON: 'JSON' };
        const title = 'iGPSe Main Clustering';
        const maxPolls = 40;

        return (
          D(actions.ensureScratchDirectory())

          .then(({ attributes: { _id: id } }) => {
            this.scratchDirectoryId = id;
            outputs = {
              ...outputs,
              transferData: `FILE:${id}:transfer-data.RData`,
              output_mrna_heatmap: `FILE:${id}:mrna_heatmap.png`,
              output_mirna_heatmap: `FILE:${id}:mirna_heatmap.png`
            };
          })

          .then(() => (
            analysisUtils.runTask(
              task,
              { inputs, outputs },
              { title, maxPolls }
            )
          ))

          .then(
            ({
              clustersJSON: { data: clusterData },
              transferData: { fileId: transferDataId },
              output_mrna_heatmap: { fileId: mrnaMapId },
              output_mirna_heatmap: { fileId: mirnaMapId }
            }) => {
              Object.assign(this, {
                clusterData,
                transferDataId,
                mrnaMapId,
                mirnaMapId
              });
            }
          )
        );
      })
    );
  }

  runSubsetProcessJob(state) {
    return (
      this.constructPromise

      .then(() => {
        const task = 'igpse-survival-plot';
        const inputs = {
          transferData: `FILE:${this.transferDataId}`,
          groups: `STRING:${JSON.stringify({
            GROUP1: this.parallelSets[0],
            GROUP2: this.parallelSets[1]
          })}`
        };
        const title = 'iGPSe Survival Plot';
        const maxPolls = 40;
        let outputs;

        return (
          D(actions.ensureScratchDirectory())

          .then(({ attributes: { _id: id } }) => {
            this.scratchDirectoryId = id;
            outputs = {
              dataplot: `FILE:${this.scratchDirectoryId}:survival-plot.png`
            };
          })

          .then(() => (
            analysisUtils.runTask(
              task,
              { inputs, outputs },
              { title, maxPolls }
            )
          ))

          .then(
            ({
              dataplot: { fileId: survivalPlotId }
            }) => {
              Object.assign(this, { survivalPlotId });
            }
          )
        );
      })
    );
  }

  makeAutocompleteHandler({
    delay,
    maxSuggestions,
    minSubstringLength,
    getSuggestionIterator,
    updateSuggestions
  }) {
    delay = delay || 100;
    maxSuggestions = maxSuggestions || 10;
    minSubstringLength = minSubstringLength || 1;

    let delayCallback;
    const result = (value) => {
      if (delayCallback) {
        delayCallback(value);
      } else {
        (
          delayedSemaphore(
            (cb) => {
              delayCallback = cb;
              cb(value);
            },
            delay
          )

          .then((value) => {
            if (value.length < minSubstringLength) {
              return [];
            }

            let v = value.toLowerCase();
            let suggestions = [];
            let nextSuggestion = getSuggestionIterator();
            while (suggestions.length < maxSuggestions) {
              let candidate = nextSuggestion();
              if (!candidate) {
                break;
              }

              let testValue = (
                [candidate.id, candidate.description]
                .join(' ')
                .toLowerCase()
              );

              if (testValue.indexOf(v) >= 0) {
                suggestions.push(candidate);
              }
            }
            return suggestions;
          })

          .then(updateSuggestions)

          .then(() => (delayCallback = null))
        );
      }
    };

    return result;
  }

  _action_featureSelection_mrnaFeatureUpdate(data, page, action, value) {
    let handler = this._mrnaHandler;
    if (!handler) {
      handler = this.makeAutocompleteHandler({
        getSuggestionIterator: () => {
          let index = 0;
          return () => (this.mrnaExtractResult[index++]);
        },
        updateSuggestions: (candidates) => (
          D(actions.updateAnalysisElementState(
            this.elements.featureSelection[0],
            { candidates }
          ))
        )
      });

      this._mrnaHandler = handler;
    }

    this._mrnaHandler(value);
  }

  _action_featureSelection_mirnaFeatureUpdate(data, page, action, value) {
    let handler = this._mirnaHandler;
    if (!handler) {
      handler = this.makeAutocompleteHandler({
        getSuggestionIterator: () => {
          let index = 0;
          return () => (this.mirnaExtractResult[index++]);
        },
        updateSuggestions: (candidates) => (
          D(actions.updateAnalysisElementState(
            this.elements.featureSelection[1],
            { candidates }
          ))
        )
      });

      this._mirnaHandler = handler;
    }

    this._mirnaHandler(value);
  }

  tmp_dbg_0() {
    return (
      this.constructPromise

      .then(() => (
        Promise.all(
          [
            [0, '58daec3488628a186899d63b'],
            [1, '58daec3488628a186899d645'],
            [2, '58daec3488628a186899d63f']
          ].map(([i, id]) => (
            D(actions.populateFileSelectionElement(
              this.elements.input[i], id
            ))
          ))
        )
      ))

      .delay(10)

      .then(() => this.triggerAction('input', 'process'))
    );
  }
}

