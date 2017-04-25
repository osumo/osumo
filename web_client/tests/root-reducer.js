import { createStore } from 'redux';
import rootReducer from '../reducer';
import ACTION_TYPES from '../reducer/action-types';
import test from 'tape';

test('add analysis page', (t) => {
  const store = createStore(rootReducer);
  let state = store.getState();

  console.log('initial state');
  console.log(state);

  const action = (act) => {
    console.log('ACTION');
    console.log(JSON.stringify(act, null, 2));
    store.dispatch(act);
    console.log(JSON.stringify(store.getState(), null, 2));
  };

  action({ type: ACTION_TYPES.TOGGLE_HEADER_DROPDOWN });
  action({ type: ACTION_TYPES.OPEN_FILE_SELECTOR_DIALOG });
  action({
    type: ACTION_TYPES.UPDATE_DIALOG_FORM,
    form: { one: 1, two: 2, three: 3 }
  });
  action({ type: ACTION_TYPES.SET_GLOBAL_NAV_TARGET, target: 'testing' });
  action({ type: ACTION_TYPES.CLOSE_DIALOG });

  t.end();
});
