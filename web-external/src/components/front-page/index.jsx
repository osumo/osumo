import React from 'react';

import Marketing from './marketing';

import propTypes from '../../prop-types';

class FrontPage extends React.Component {
  render () {
    return (
      <div id='g-app-body-container' className='g-default-layout'>
        <Marketing />
      </div>
    );
  }

  static get propTypes () {
    return {
      apiRoot: propTypes.apiRoot,
      currentUser: propTypes.currentUser,
      onCollections: propTypes.onCollections,
      onFolders: propTypes.onFolders,
      onInfo: propTypes.onInfo,
      onLogin: propTypes.onLogin,
      onRegister: propTypes.onRegister,
      staticRoot: propTypes.staticRoot
    };
  }
}

export default FrontPage;
