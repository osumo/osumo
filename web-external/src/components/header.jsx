import React from 'react';

import User from './header/user';

import propTypes from '../prop-types';

class Header extends React.Component {
  render () {
    let {
      currentUser,
      onFolders,
      onInfo,
      onLogout,
      onLogin,
      onRegister,
      onTitle
    } = this.props;

    return (
      <div id='g-app-header-container'>
        <div className='g-header-wrapper'>
          <div className='g-app-title' onClick={ onTitle }>
            SUMO
          </div>
          <User currentUser={ currentUser }
                onFolders={ onFolders }
                onInfo={ onInfo }
                onLogout={ onLogout }
                onLogin={ onLogin }
                onRegister={ onRegister }/>
          <div className='g-clear-both'/>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      currentUser: propTypes.currentUser,
      onFolders: propTypes.onFolders,
      onInfo: propTypes.onInfo,
      onLogout: propTypes.onLogout,
      onLogin: propTypes.onLogin,
      onRegister: propTypes.onRegister,
      onTitle: propTypes.onTitle
    };
  }
}

export default Header;
