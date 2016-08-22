import { createStore } from 'redux';
import { compose } from '../src/utils/reducer';
import { setScalar } from '../src/utils/common-reducers';
import test from 'tape';

test('compose duplicate leaves', (t) => {
  const scalar = (def) => compose({ set: setScalar }).defaultState(def);

  const a  = scalar('a');
  const b  = scalar('b');
  const ca = scalar('ca');
  const cb = scalar('CB');

  const c = compose({
    'b.set': (state, action) => {
      let newAction = {
        ...action,
        type: cb().set,
        value: action.value.toUpperCase()
      };

      let newB = cb(state.b, newAction);
      let newState = state;
      if(newB !== state.b) {
        newState = {
          ...state,
          b: newB
        };
      }

      return newState;
    }
  }).children({a: ca, b: cb});

  const reducer = compose().children({a, b, c});
  const store = createStore(reducer);
  const actionTypes = reducer();

  let state = store.getState();
  t.equal(state.a, 'a');
  t.equal(state.b, 'b');
  t.equal(state.c.a, 'ca');
  t.equal(state.c.b, 'CB');

  store.dispatch({ type: actionTypes.a.set, value: "aa" });
  state = store.getState();
  t.equal(state.a, 'aa');
  t.equal(state.b, 'b');
  t.equal(state.c.a, 'ca');
  t.equal(state.c.b, 'CB');

  store.dispatch({ type: actionTypes.b.set, value: "bb" });
  state = store.getState();
  t.equal(state.a, 'aa');
  t.equal(state.b, 'bb');
  t.equal(state.c.a, 'ca');
  t.equal(state.c.b, 'CB');

  store.dispatch({ type: actionTypes.c.a.set, value: "caca" });
  state = store.getState();
  t.equal(state.a, 'aa');
  t.equal(state.b, 'bb');
  t.equal(state.c.a, 'caca');
  t.equal(state.c.b, 'CB');

  store.dispatch({ type: actionTypes.c.b.set, value: "cbcb" });
  state = store.getState();
  t.equal(state.a, 'aa');
  t.equal(state.b, 'bb');
  t.equal(state.c.a, 'caca');
  t.equal(state.c.b, 'CBCB');

  t.end();
});
