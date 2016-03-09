import React from 'react';
// import { connect } from 'react-redux';
// import { partial } from 'underscore';

import User from './header/user';

class Header extends React.Component {
  // <SearchWidget attr={ this.props.attr }/>
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
          <div className='g-app-title'
             onClick={ onTitle }>
            Girder
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
}

Header.propTypes = {
  currentUser: React.PropTypes.string.isRequired,
  onFolders: React.PropTypes.string.isRequired,
  onInfo: React.PropTypes.string.isRequired,
  onLogout: React.PropTypes.string.isRequired,
  onLogin: React.PropTypes.string.isRequired,
  onRegister: React.PropTypes.string.isRequired,
  onTitle: React.PropTypes.string.isRequired
};

export default Header;
