import { createStore } from 'redux';
import analysis from '../reducer/analysis';
import ACTION_TYPES from '../reducer/action-types';
import test from 'tape';

test('add analysis page', (t) => {
  const store = createStore(analysis);
  let state = store.getState();

  console.log('initial state');
  console.log(state);

  let page = {
    key: 'test',
    name: 'testName',
    description: 'testDescription',
    notes: 'testNotes'
  };

  store.dispatch({
    type: ACTION_TYPES.ADD_ANALYSIS_PAGE,
    page
  });

  state = store.getState();
  console.log('add analysis page');
  console.log(JSON.stringify(state, null, 2));

  t.equal(state.pages[0], 0);
  t.equal(state.objects[state.pages[0]].key, 'test');
  t.equal(state.objects[state.pages[0]].name, 'testName');
  t.equal(state.objects[state.pages[0]].description, 'testDescription');
  t.equal(state.objects[state.pages[0]].notes, 'testNotes');

  let element = {
    key: '(e) test',
    name: '(e) testName',
    description: '(e) testDescription',
    notes: '(e) testNotes'
  };
  store.dispatch({
    type: ACTION_TYPES.ADD_ANALYSIS_ELEMENT,
    element
  });

  state = store.getState();
  console.log('add analysis element');
  console.log(JSON.stringify(state, null, 2));

  let subElement = {
    key: '(se) test',
    name: '(se) testName',
    description: '(se) testDescription',
    notes: '(se) testNotes'
  };
  store.dispatch({
    type: ACTION_TYPES.ADD_ANALYSIS_ELEMENT,
    element: subElement,
    parent: 1
  });

  state = store.getState();
  console.log('add analysis subelement');
  console.log(JSON.stringify(state, null, 2));

  store.dispatch({
    type: ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT_STATE,
    element: 1,
    state: { value: 42, foo: 'bar' }
  });

  state = store.getState();
  console.log('update analysis element state');
  console.log(JSON.stringify(state, null, 2));

  store.dispatch({
    type: ACTION_TYPES.UPDATE_ANALYSIS_ELEMENT_STATE,
    element: 2,
    state: { value: 42, foo: 'bar' }
  });

  state = store.getState();
  console.log('update analysis subelement state');
  console.log(JSON.stringify(state, null, 2));

  const { floor, random } = Math;

  for (let i = 0; i < 20; ++i) {
    if (random() < 0.1) {
      store.dispatch({
        type: ACTION_TYPES.ADD_ANALYSIS_PAGE,
        page: { oh: 'hai' }
      });

      continue;
    }

    let { idAllocator: { maxId } } = store.getState();
    let parentId = floor(random() * maxId);
    store.dispatch({
      type: ACTION_TYPES.ADD_ANALYSIS_ELEMENT,
      element: {},
      parent: parentId
    });
  }

  state = store.getState();
  console.log('random additions');
  console.log(JSON.stringify(state, null, 2));

  store.dispatch({
    type: ACTION_TYPES.REMOVE_ANALYSIS_ELEMENT,
    element: 5
  });

  state = store.getState();
  console.log('remove 5');
  console.log(JSON.stringify(state, null, 2));

  let { lastPageId } = store.getState();
  store.dispatch({
    type: ACTION_TYPES.REMOVE_ANALYSIS_PAGE,
    element: lastPageId
  });

  state = store.getState();
  console.log(`remove last page id ${lastPageId}`);
  console.log(JSON.stringify(state, null, 2));

  let action = {
    type: ACTION_TYPES.ADD_ANALYSIS_PAGE,
    page: { key: 'multi' }
  };

  store.dispatch(action);
  store.dispatch(action);
  store.dispatch(action);
  store.dispatch(action);

  state = store.getState();
  console.log('remove multi page');
  console.log('BEFORE');
  console.log(JSON.stringify(state, null, 2));

  store.dispatch({ type: ACTION_TYPES.REMOVE_ANALYSIS_PAGE, key: 'multi' });
  state = store.getState();
  console.log('remove multi page');
  console.log('AFTER');
  console.log(JSON.stringify(state, null, 2));

  t.end();
});
