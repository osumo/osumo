import React from 'react';
import { partial } from 'underscore';

class User extends React.Component {
  render () {
    let result;
    let {
      currentUser,
      onFolders,
      onInfo,
      onLogout,
      onLogin,
      onRegister
    } = this.props;

    /* TODO(opadron): this should be broken down into further components. */
    if (currentUser) {
      let id = currentUser._id;

      onFolders = partial(onFolders, id);
      onInfo = partial(onInfo, id);
      onLogout = partial(onLogout, id);

      result = (
        <div className='g-current-user-wrapper'>
          <div className='g-user-text'>
            <a data-toggle='dropdown' data-target='#g-user-action-menu'>
              { currentUser.firstName } { currentUser.lastName }
              <i className='icon-down-open'/>
            </a>
            <div id='g-user-action-menu' className='dropdown'>
              <ul className='dropdown-menu' role='menu'>
                <li role='presentation'>
                  <a className='g-my-folders' onClick={ onFolders }>
                    <i className='icon-folder'>My folders</i>
                  </a>
                </li>
                <li role='presentation'>
                  <a className='g-my-settings'
                     onClick={ onInfo }>
                    <i className='icon-cog'>My account</i>
                  </a>
                </li>
                <li className='divider' role='presentation'/>
                <li role='presentation'>
                  <a className='g-logout'
                     onClick={ onLogout }>
                    <i className='icon-logout'>Log out</i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    } else {
      result = (
        <div className='g-current-user-wrapper'>
          <div className='g-user-text'>
            <a className='g-register'
               onClick={ onRegister }>
               Register
            </a>
            <span> or </span>
            <a className='g-login'
               onClick={ onLogin }>
              Log In
              <i className='icon-login'/>
            </a>
          </div>
        </div>
      );
    }

    return result;
  }
}

User.propTypes = {
  currentUser: React.PropTypes.string.isRequired,
  onFolders: React.PropTypes.string.isRequired,
  onInfo: React.PropTypes.string.isRequired,
  onLogout: React.PropTypes.string.isRequired,
  onLogin: React.PropTypes.string.isRequired,
  onRegister: React.PropTypes.string.isRequired
};

export default User;
