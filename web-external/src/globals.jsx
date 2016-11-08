import $ from 'jquery';
import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';

import restRequests from './utils/rest-requests';
import events from './utils/events';
export const apiRoot = girder.apiRoot = 'api/v1';
export const staticRoot = 'static';
export const rest = restRequests({ events, apiRoot });

import reducer from './reducer';
export const actionTypes = reducer();
export const store = (
  (process.env.NODE_ENV && process.env.NODE_ENV === 'production')
  ? createStore(reducer)
  : createStore(reducer, applyMiddleware(createLogger()))
);

export let routeStack = [];
import makeRouter from './utils/router';
export const router = makeRouter();
router.base();
router.pushState(false);

export const $rootDiv = $('<div>').attr('id', 'root');

let itemSelectedCallback = null;

export default {
  apiRoot,
  rest,
  actionTypes,
  staticRoot,
  store,
  router,
  routeStack,
  $rootDiv,
  itemSelectedCallback
};
