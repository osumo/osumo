import objectReduce from '../utils/object-reduce';

export default ([
  /* regular elements and subelements */
  'ADD_ANALYSIS_ELEMENT',
  'ADD_ANALYSIS_PAGE',
  'CLEAR_LOGIN_INFO',
  'CLOSE_DIALOG',
  'CLOSE_HEADER_DROPDOWN',
  'DISPATCH_COMPOUND_ACTION',
  'OPEN_FILE_SELECTOR_DIALOG',
  'OPEN_HEADER_DROPDOWN',
  'OPEN_LOGIN_DIALOG',
  'OPEN_RESET_PASSWORD_DIALOG',
  'OPEN_REGISTER_DIALOG',
  'REMOVE_ANALYSIS_ELEMENT',
  'REMOVE_ANALYSIS_PAGE',
  /* field and message */
  'SET_DIALOG_ERROR',
  /* field and time */
  'SET_DIALOG_FOCUS',
  'SET_FILE_NAVIGATION_ROOT',
  'SET_GLOBAL_NAV_TARGET',
  /* user and token */
  'SET_LOGIN_INFO',
  'TOGGLE_HEADER_DROPDOWN',
  'UPDATE_ANALYSIS_ELEMENT_STATE',
  'UPDATE_DIALOG_FORM'
]
  .map((x) => [x, x])
  .reduce(objectReduce, {})
);

