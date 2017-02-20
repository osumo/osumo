import React from 'react';
import { NBSP } from '../../../constants';

class LoginInvitation extends React.Component {
  render () {
    let {
      currentUser,
      onLogin
    } = this.props;

    let result = null;
    if (!currentUser) {
      const onLoginClick = (event) => {
        event.preventDefault();
        onLogin();
      };

      const logInHere = (
        <a className='g-login-link' onClick={onLoginClick} key='1'>
          Log in here.
        </a>
      );

      result = (
        <div className='g-bottom-message' key='0'>
          Already have an account?
          {NBSP}
          {logInHere}
        </div>
      );
    }

    return result;
  }

  static get defaultProps () {
    return { currentUser: null };
  }

  static get propTypes () {
    return {
      currentUser: React.PropTypes.objectOf(React.PropTypes.any),
      onLogin: React.PropTypes.func
    };
  }
}

export default LoginInvitation;
