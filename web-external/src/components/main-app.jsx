import React from 'react';

import Header from './header';
import GlobalNav from './global-nav';
import Footer from './footer';

const DummyBodyComponent = () => (
  <div id='g-app-body-container' className='g-default-layout'/>
);

class MainApp extends React.Component {
  static get defaultProps () {
    return {
      apiRoot: 'api/v1',
      currentTarget: '',
      currentUser: null,
      navList: [],
      navTable: {},
      staticRoot: 'static',

      /* TODO(opadron): replace with a warning message */
      onCollections () { console.log('ON COLLECTIONS'); },
      onQuickSearch () { console.log('ON QUICK SEARCH'); },
      onFolders () { console.log('ON FOLDERS'); },
      onInfo () { console.log('ON INFO'); },
      onRegister () { console.log('ON REGISTER'); },
      onLogin () { console.log('ON LOGIN'); },
      onNavigate () { console.log('ON NAVIGATE'); },
      onTitle () { console.log('ON TITLE'); }
    };
  }

  render () {
    let {
      apiRoot,
      currentTarget,
      currentUser,
      navList,
      navTable,
      staticRoot,

      onCollections,
      onFolders,
      onInfo,
      onLogin,
      onLogout,
      onNavigate,

      onQuickSearch,
      onRegister,
      onTitle
    } = this.props;

    let Body = navTable[currentTarget] || DummyBodyComponent;

    return (
      <div>
        <Header currentUser={ currentUser }
                onFolders={ onFolders }
                onInfo={ onInfo }
                onLogout={ onLogout }
                onLogin={ onLogin }
                onRegister={ onRegister }
                onTitle={ onTitle }/>

        <GlobalNav currentTarget={ currentTarget }
                   navList={ navList }
                   onNavigate={ onNavigate }/>

        <Body key={ currentTarget }
              apiRoot={ apiRoot }
              staticRoot={ staticRoot }
              currentUser={ currentUser }
              onCollections={ onCollections }
              onFolders={ onFolders }
              onInfo={ onInfo }
              onLogin={ onLogin }
              onNavigate={ onNavigate }
              onQuickSearch={ onQuickSearch }
              onRegister={ onRegister }/>

        <Footer apiRoot={ apiRoot }/>
      </div>
    );

    /*
     * NOTE(opadron): We can probably do away with these views/revisit them
     *                later.
     */
    // <div id='g-app-progress-container'/>
    // <div id='g-dialog-container' className='modal fade'/>
    // <div id='g-alerts-container'/>
  }
}

MainApp.propTypes = {
  apiRoot: React.PropTypes.string.isRequired,
  currentTarget: React.PropTypes.string.isRequired,
  currentUser: React.PropTypes.string.isRequired,
  navList: React.PropTypes.string.isRequired,
  navTable: React.PropTypes.string.isRequired,
  staticRoot: React.PropTypes.string.isRequired,
  onCollections: React.PropTypes.string.isRequired,
  onFolders: React.PropTypes.string.isRequired,
  onInfo: React.PropTypes.string.isRequired,
  onLogin: React.PropTypes.string.isRequired,
  onLogout: React.PropTypes.string.isRequired,
  onNavigate: React.PropTypes.string.isRequired,
  onQuickSearch: React.PropTypes.string.isRequired,
  onRegister: React.PropTypes.string.isRequired,
  onTitle: React.PropTypes.string.isRequired
};

export default MainApp;
