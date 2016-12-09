/* exported React, Provider */

import 'babel-polyfill';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import URI from 'urijs';

import globals, { router, store } from './globals';
import actions from './actions';
import routes from './routes';
import { aggregateForm } from './utils/analysis';

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

  actions.verifyCurrentUser();

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
    let { actionTypes } = globals;

    actions.registerAnalysisAction('igpse', 'process', (forms, page) => {
      let form = aggregateForm(forms, page);
      return rest({
        path: 'osumo/task/iGPSe/run?title=OSUMO Test Run',
        type: 'POST',
        data: {
          'INPUT(mrna_input_path)': `FILE:${ form.mrna_input_path }`,
          'INPUT(mirna_input_path)': `FILE:${ form.mirna_input_path }`,
          'INPUT(clinical_input_path)': `FILE:${ form.clinical_input_path }`,
          'INPUT(mrna_clusters)': `INTEGER:${ form.mrna_clusters }`,
          'INPUT(mirna_clusters)': `INTEGER:${ form.mirna_clusters }`,

          'OUTPUT(output_mrna_dim)': `FILE:${ form.output_dir }:mrna_dim.txt`,
          'OUTPUT(output_mrna_heatmap)': `FILE:${ form.output_dir }`
        }
      }).then((result) => (console.log('JOB SUBMITTED!'), console.log(result)));
    });

    const pagePromise = (page) => () => Promise.all([
      Promise.delay(500),
      actions.addAnalysisPage(page)
    ]);

    const elementPromise = (element) => () => Promise.all([
      Promise.delay(10),
      actions.addAnalysisElement(element)
    ]);

    (
      Promise
        .delay(1000)
        .then(pagePromise({
          name: 'igpse',
          description: 'Interactive Genomics Patient Stratification explorer',
          notes: (
            'Show a survival plot based on clustering of different data sets.'),
          mainAction: 'process'
        }))


        .then(elementPromise({
          key: 'mrna_input_path',
          name: 'Gene Expression Profile',
          description: 'mRNA data',
          notes: ('This must be a CSV file with one column per ' +
                  'subject, one header row, and one data row per gene.'),
          type: 'fileSelection',
          options: { onlyNames: '^mRNA.*csv$' }
        }))

        .then(elementPromise({
          key: 'mrna_clusters',
          name: 'mRNA Number of Clusters (k)',
          description: 'The number (k) of clusters used in calculations',
          notes: 'Clustering is performed via k-means.',
          type: 'field',
          options: {
            dataType: 'integer',
            default: 5
          }
        }))

        .then(elementPromise({
          key: 'mirna_input_path',
          name: 'MicroRNA Expression Profile',
          description: 'miRNA data',
          notes: ('This must be a CSV file with one column per ' +
                  'subject, one header row, and one data row per micro RNA.'),
          type: 'fileSelection',
          options: { onlyNames: '^miRNA.*csv$' }
        }))

        .then(elementPromise({
          key: 'mirna_clusters',
          name: 'miRNA Number of Clusters (k)',
          description: 'The number (k) of clusters used in calculations',
          notes: 'Clustering is performed via k-means.',
          type: 'field',
          options: {
            dataType: 'integer',
            default: 5
          }
        }))

        .then(elementPromise({
          key: 'clinical_input_path',
          name: 'Clinical Profile',
          notes: ('This must be a CSV file with a header row and one row ' +
                  'per subject and columns containing the row description, ' +
                  'survival duration, and an indicator field.'),
          type: 'fileSelection',
          options: { onlyNames: '^time.*csv$' }
        }))

        .then(elementPromise({
          key: 'output_dir',
          name: 'Output Location',
          description: 'output data folder',
          notes: ('Location where the mRNA heatmap, miRNA ' +
                  'heatmap, and cluster data is stored.'),
          type: 'folderSelection'
        }))

        .then(elementPromise({
          type: 'button',
          name: 'Process'
        }))

        .then(() => Promise.delay(1000))

        .then(() => {
          Object.entries({
            mrna_input_path: {
              name: 'mRNA.sample.csv',
              path: '/users/osumopublicuser/OSUMO Inputs/mRNA.sample.csv',
              value: '57a8b6247be3a054f8be9102'
            },

            mirna_input_path: {
              name: 'miRNA.sample.csv',
              path: '/users/osumopublicuser/OSUMO Inputs/miRNA.sample.csv',
              value: '57a8b6247be3a054f8be90fa'
            },

            clinical_input_path: {
              name: 'time.cencer.csv',
              path: '/users/osumopublicuser/OSUMO Inputs/time.cencer.csv',
              value: '57a8b6247be3a054f8be9113'
            },

            mrna_clusters: { value: '5' },

            mirna_clusters: { value: '3' },

            output_dir: { value: '582bc1517be3a024f80ff17c' }
          }).forEach((args) => actions.setAnalysisFormState('igpse', ...args))
        })
    );
  }
});

