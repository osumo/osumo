
import React from 'react';

import Header from './front-page/header';
import Body from './front-page/body';

import propTypes from '../prop-types';

class FrontPage extends React.Component {
  render () {
    let {
      apiRoot,
      staticRoot,
      currentUser,
      onCollections,
      onFolders,
      onInfo,
      onRegister,
      onLogin
    } = this.props;

    return (
      <div id='g-app-body-container' className='g-default-layout'>
        <Header staticRoot={ staticRoot }/>
        <Body
          apiRoot={ apiRoot }
          currentUser={ currentUser }
          onCollections={ onCollections }
          onFolders={ onFolders }
          onInfo={ onInfo }
          onRegister={ onRegister }
          onLogin={ onLogin }
        />
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
