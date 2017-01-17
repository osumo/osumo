import { isNil } from 'lodash';
import ACTION_TYPES from './action-types';

const ensure = (x, def) => (isNil(x) ? def : x);

const setDropdownOpened = (header, opened) => {
  if (header.dropdownOpened !== opened) {
    header = { ...header, dropdownOpened: opened };
  }

  return header;
};

const header = (state={}, action) => {
  const { type } = action;

  if (
    type === ACTION_TYPES.CLEAR_LOGIN_INFO           ||
    type === ACTION_TYPES.CLOSE_DIALOG               ||
    type === ACTION_TYPES.CLOSE_HEADER_DROPDOWN      ||
    type === ACTION_TYPES.OPEN_FILE_SELECTOR_DIALOG  ||
    type === ACTION_TYPES.OPEN_LOGIN_DIALOG          ||
    type === ACTION_TYPES.OPEN_RESET_PASSWORD_DIALOG ||
    type === ACTION_TYPES.OPEN_REGISTER_DIALOG       ||
    type === ACTION_TYPES.SET_GLOBAL_NAV_TARGET      ||
    type === ACTION_TYPES.SET_LOGIN_INFO
  ) {
    state = setDropdownOpened(state, false);
  }


  if (type === ACTION_TYPES.OPEN_HEADER_DROPDOWN) {
    state = setDropdownOpened(state, true);

  } else if (type === ACTION_TYPES.TOGGLE_HEADER_DROPDOWN) {
    state = setDropdownOpened(state, !state.dropdownOpened);
  }

  return state;
};

export default header;
