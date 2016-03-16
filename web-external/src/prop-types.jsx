import React from 'react';

let {
  arrayOf,
  element,
  func,
  number,
  objectOf,
  oneOfType,
  shape,
  string
} = React.PropTypes;

const NAV_LIST_TYPE = arrayOf(
  shape({
    id: number,
    value: shape({
      name: string,
      icon: string,
      target: string
    })
  })
);

const NAV_TABLE_TYPE = objectOf(oneOfType([element, func]));

const propTypes = {
  apiRoot: string,
  currentTarget: string,
  currentUser: string,
  navList: NAV_LIST_TYPE,
  navTable: NAV_TABLE_TYPE,

  onCollections: func,
  onFolders: func,
  onInfo: func,
  onLogin: func,
  onLogout: func,
  onNavigate: func,
  onRegister: func,
  onTitle: func,

  staticRoot: string
};

export default propTypes;
