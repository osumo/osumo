import $ from 'jquery';
import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import { rest as girderRest } from 'girder';
export const apiRoot = girderRest.apiRoot;

import restRequests from './utils/rest-requests';
export const staticRoot = 'static';
export const rest = restRequests;

import reducer from './reducer';

export const IN_PRODUCTION = (
  process.env.NODE_ENV && process.env.NODE_ENV === 'production'
);

export const store = (
  IN_PRODUCTION
  ? createStore(reducer, applyMiddleware(thunk))
  : createStore(reducer, applyMiddleware(thunk, createLogger({
    diff: true,
    collapsed: () => true
  })))
);

import Promise from 'bluebird';

Promise.config({
  warnings: !IN_PRODUCTION,
  longStackTraces: !IN_PRODUCTION,
  cancellation: true,
  monitoring: !IN_PRODUCTION
});

import makeRouter from './utils/router';
export const router = makeRouter();
router.base();
router.pushState(false);

export const $backdropRootDiv = $('<div>').attr('id', 'backdrop-root');
export const $dialogRootDiv = $('<div>').attr('id', 'dialog-root');
export const $mainRootDiv = $('<div>').attr('id', 'main-root');
export let analysisActionTable = {};

let itemFilter = null;
let itemSelectedCallback = null;

export default {
  analysisActionTable,
  apiRoot,
  IN_PRODUCTION,
  staticRoot,
  store,
  rest,
  router,
  $backdropRootDiv,
  $dialogRootDiv,
  $mainRootDiv,
  itemFilter,
  itemSelectedCallback
};
