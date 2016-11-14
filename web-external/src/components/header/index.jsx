import React from 'react';
import User from './user';

class Header extends React.Component {
  render () {
    let {
      currentUser,
      dropdownOpened,
      onDropdown,
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
                dropdownOpened={ dropdownOpened }
                onDropdown={ onDropdown }
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
      currentUser: React.PropTypes.objectOf(React.PropTypes.any),
      dropdownOpened: React.PropTypes.bool,
      onDropdown: React.PropTypes.func,
      onFolders: React.PropTypes.func,
      onInfo: React.PropTypes.func,
      onLogout: React.PropTypes.func,
      onLogin: React.PropTypes.func,
      onRegister: React.PropTypes.func,
      onTitle: React.PropTypes.func
    };
  }
}

export default Header;
