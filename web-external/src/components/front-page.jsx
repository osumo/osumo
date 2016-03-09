
import React from 'react';

import Header from './front-page/header';
import Body from './front-page/body';

class FrontPage extends React.Component {
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

FrontPage.propTypes = {
  apiRoot: React.PropTypes.string.isRequired,
  staticRoot: React.PropTypes.string.isRequired,
  currentUser: React.PropTypes.string.isRequired,
  onCollections: React.PropTypes.string.isRequired,
  onQuickSearch: React.PropTypes.string.isRequired,
  onFolders: React.PropTypes.string.isRequired,
  onInfo: React.PropTypes.string.isRequired,
  onRegister: React.PropTypes.string.isRequired,
  onLogin: React.PropTypes.string.isRequired
};

export default FrontPage;
