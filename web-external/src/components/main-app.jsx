import React from 'react';

import Header from './header';
import GlobalNav from './global-nav';
import Footer from './footer';

import propTypes from '../prop-types';

const DummyBodyComponent = () => (
  <div id='g-app-body-container' className='g-default-layout'/>
);

class MainApp extends React.Component {
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
      onFolders () { console.log('ON FOLDERS'); },
      onInfo () { console.log('ON INFO'); },
      onRegister () { console.log('ON REGISTER'); },
      onLogin () { console.log('ON LOGIN'); },
      onNavigate () { console.log('ON NAVIGATE'); },
      onTitle () { console.log('ON TITLE'); }
    };
  }

  static get propTypes () {
    return {
      apiRoot: propTypes.apiRoot,
      currentTarget: propTypes.currentTarget,
      currentUser: propTypes.currentUser,
      navList: propTypes.navList,
      navTable: propTypes.navTable,
      onCollections: propTypes.onCollections,
      onFolders: propTypes.onFolders,
      onInfo: propTypes.onInfo,
      onLogin: propTypes.onLogin,
      onLogout: propTypes.onLogout,
      onNavigate: propTypes.onNavigate,
      onRegister: propTypes.onRegister,
      onTitle: propTypes.onTitle,
      staticRoot: propTypes.staticRoot
    };
  }
}

export default MainApp;
