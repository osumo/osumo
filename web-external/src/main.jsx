/* exported React, Provider */

import 'babel-polyfill';

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';

import globals, { router, store } from './globals';
import actions from './actions';
import routes from './routes';

import MainApp from './components/main-app';

import './style/full-viewport';

$(() => {
  $(document.body).append(globals.$rootDiv);
  actions.verifyCurrentUser();

  /* create main application component and render */
  let App = connect(
    ({
      dialog: { componentKey: dialogComponentKey }
    }) => ({ dialogComponentKey })
  )(MainApp);

  router('', routes.setGlobalNavTargetToIndex);
  router(':target', ...routes.targetMiddleWare);
  router.start();

  ReactDOM.render(
    <Provider store={ store }><App/></Provider>,
    globals.$rootDiv[0]
  );

  /* expose some variables for debugging.  This also exposes d3 in a way the
   * parallel sets javascript expects. */
  Object.assign(window, {
    ...globals,
    commonReducers: require('./utils/common-reducers'),
    React,
    router,
    actions
  });
});

