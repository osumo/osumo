/* exported React, Provider */

import 'babel-polyfill';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import URI from 'urijs';
import { isUndefined } from 'lodash';

import globals, { router, store } from './globals';
import actions from './actions';
import routes from './routes';
import { aggregateForm, runTask } from './utils/analysis';

import MainApp from './components/main-app';
import DialogBackdrop from './components/dialog/backdrop';
import DialogContainer from './components/containers/dialog';

import './style/full-viewport';

$(() => {
  /* disable girder's router navigation as it clashes with our router */
  girder.router.navigate = () => null;

  $(document.body).append(globals.$mainRootDiv)
                  .append(globals.$dialogRootDiv)
                  .append(globals.$backdropRootDiv);

  store.dispatch(actions.verifyCurrentUser());

  /* create main application component and render */
  let App = connect(
    ({
      dialog: { componentKey: dialogComponentKey }
    }) => ({ dialogComponentKey })
  )(MainApp);

  let Backdrop = connect(
    ({ dialog: { componentKey } }) => ({ enabled: !!componentKey })
  )(DialogBackdrop);

  router(
    '',
    routes.setGlobalNavTargetToIndex
  );

  router(
    '?*query',
    routes.setGlobalNavTargetToIndex,
    ...[routes.targetMiddleWare.slice(1)]
  );

  router(
    ':target',
    ...routes.targetMiddleWare
  );

  router(
    ':target?*query',
    ...routes.targetMiddleWare
  );

  router.start();

  ReactDOM.render(
    <Provider store={ store }><App/></Provider>,
    globals.$mainRootDiv[0]
  );

  ReactDOM.render(
    <Provider store={ store }><DialogContainer/></Provider>,
    globals.$dialogRootDiv[0]
  );

  ReactDOM.render(
    <Provider store={ store }><Backdrop/></Provider>,
    globals.$backdropRootDiv[0]
  );

  if (!globals.IN_PRODUCTION) {
    /* expose some variables for debugging. */
    Object.assign(window, {
      ...globals,
      commonReducers: require('./utils/common-reducers'),
      React,
      router,
      store,
      rest: globals.rest,
      actions,
      URI
    });

    let { Promise } = require('./utils/promise');

    const igpseProcess = function (forms, page) {
      let form = aggregateForm(forms, page);
      return runTask(
        'iGPSe',
        {
          inputs: {
            mrna_input_path: `FILE:${ form.mrna_input_path }`,
            mirna_input_path: `FILE:${ form.mirna_input_path }`,
            clinical_input_path: `FILE:${ form.clinical_input_path }`,
            mrna_clusters: `INTEGER:${ form.mrna_clusters }`,
            mirna_clusters: `INTEGER:${ form.mirna_clusters }`
          },

          outputs: {
            clustersJSON: `FILE:${ form.output_dir }:clusters.json`,
            output_mrna_heatmap: `FILE:${ form.output_dir }:mrna_heatmap.png`,
            output_mirna_heatmap: `FILE:${ form.output_dir }:mirna_heatmap.png`
          }
        },
        {
          title: 'OSUMO Test Run',
          maxPolls: 40
        }
      ).then((files) => {
        let mRNAFileId;
        let miRNAFileId;
        let clustersId;

        files.forEach(({ fileId: fid, name }) => {
          if (name === 'mrna_heatmap.png') { mRNAFileId = fid; }
          if (name === 'mirna_heatmap.png') { miRNAFileId = fid; }
          if (name === 'clusters.json') { clustersId = fid; }
        });

        return Promise.all([
          (
            this.dispatch(actions.addAnalysisPage({
              key: 'igpse2',
              name: 'iGPSe Part 2',
              description: ('Interactive Genomics Patient ' +
                            'Stratification explorer (Step 2)'),
              mainAction: 'process'
            }))

            .then(
              (parent) => this.dispatch(actions.addAnalysisElement({
                parent,
                name: 'mRNA Heatmap',
                notes: ('The major groups show how the data was ' +
                        'clustered.  The columns show different mRNA ' +
                        'attributes, and the rows represent each subject.'),
                type: 'image',
                fileId: mRNAFileId
              }))

              .then(() => this.dispatch(actions.addAnalysisElement({
                parent,
                name: 'miRNA Heatmap',
                notes: ('The major groups show how the data was ' +
                        'clustered.  The columns show different miRNA ' +
                        'attributes, and the rows represent each subject.'),
                type: 'image',
                fileId: miRNAFileId
              })))

              .then(() => parent)
            )
          ),

          (
            globals.rest({ path: `file/${ clustersId }/download` })
              .then(({ response }) => response)
          )
        ])

        .then(([parent, clusterData]) => this.dispatch(
          actions.addAnalysisElement({
            parent,
            name: 'parallel sets',
            key: 'pSets',
            notes: 'Parallel Sets',
            type: 'parallelSets',
            inputData: clusterData
          })
        ))
      });
    };

    store.dispatch(
      actions.registerAnalysisAction('igpse', 'process', igpseProcess)
    )

    .then(() => store.dispatch(actions.addAnalysisPage({
      key: 'igpse',
      name: 'iGPSe',
      description: 'Interactive Genomics Patient Stratification explorer',
      notes: (
        'Show a survival plot based on clustering of different data sets.'),
      mainAction: 'process'
    })))

    .then(
      (parent) => store.dispatch(actions.addAnalysisElement({
        parent,
        key: 'mrna_input_path',
        name: 'Gene Expression Profile',
        description: 'mRNA data',
        notes: ('This must be a CSV file with one column per ' +
                'subject, one header row, and one data row per gene.'),
        type: 'fileSelection',
        options: { onlyNames: '^mRNA.*csv$' }
      }))

      .then(() => store.dispatch(actions.addAnalysisElement({
        parent,
        key: 'mrna_clusters',
        name: 'mRNA Number of Clusters (k)',
        description: 'The number (k) of clusters used in calculations',
        notes: 'Clustering is performed via k-means.',
        type: 'field',
        options: {
          dataType: 'integer',
          default: 5
        }
      })))

      .then(() => store.dispatch(actions.addAnalysisElement({
        parent,
        key: 'mirna_input_path',
        name: 'MicroRNA Expression Profile',
        description: 'miRNA data',
        notes: ('This must be a CSV file with one column per ' +
                'subject, one header row, and one data row per micro RNA.'),
        type: 'fileSelection',
        options: { onlyNames: '^miRNA.*csv$' }
      })))

      .then(() => store.dispatch(actions.addAnalysisElement({
        parent,
        key: 'mirna_clusters',
        name: 'miRNA Number of Clusters (k)',
        description: 'The number (k) of clusters used in calculations',
        notes: 'Clustering is performed via k-means.',
        type: 'field',
        options: {
          dataType: 'integer',
          default: 5
        }
      })))

      .then(() => store.dispatch(actions.addAnalysisElement({
        parent,
        key: 'clinical_input_path',
        name: 'Clinical Profile',
        notes: ('This must be a CSV file with a header row and one row ' +
                'per subject and columns containing the row description, ' +
                'survival duration, and an indicator field.'),
        type: 'fileSelection',
        options: { onlyNames: '^time.*csv$' }
      })))

      .then(() => store.dispatch(actions.addAnalysisElement({
        parent,
        key: 'output_dir',
        name: 'Output Location',
        description: 'output data folder',
        notes: ('Location where the mRNA heatmap, miRNA ' +
                'heatmap, and cluster data is stored.'),
        type: 'folderSelection'
      })))

      .then(() => store.dispatch(actions.addAnalysisElement({
        parent,
        type: 'button',
        name: 'Process'
      })))
    );
  }
});

