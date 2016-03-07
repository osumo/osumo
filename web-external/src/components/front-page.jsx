
import React from 'react';

import Header from './front-page/header';
import Body from './front-page/body';

export default class FrontPage extends React.Component {
  render () {
    let {
      apiRoot,
      staticRoot,
      currentUser,
      onCollections,
      onQuickSearch,
      onFolders,
      onInfo,
      onRegister,
      onLogin
    } = this.props;

    return (
      <div id='g-app-body-container' className='g-default-layout'>
      <Header staticRoot={ staticRoot }/>
      <Body apiRoot={ apiRoot }
      currentUser={ currentUser }
      onCollections={ onCollections }
      onQuickSearch={ onQuickSearch }
      onFolders={ onFolders }
      onInfo={ onInfo }
      onRegister={ onRegister }
      onLogin={ onLogin }/>
      </div>
    );
  }
}

