import React from 'react';
import { NBSP } from '../../../constants';

class RegisterAndLoginInvitation extends React.Component {
  render () {
    let {
      onRegister,
      onLogin
    } = this.props;

    const onRegisterClick = (event) => {
      event.preventDefault();
      onRegister();
    };

    const onLoginClick = (event) => {
      event.preventDefault();
      onLogin();
    };

    return (
      <div className='g-bottom-message'>
        <a className='g-register-link' onClick={onRegisterClick}>Register</a>
        {NBSP}|{NBSP}
        <a className='g-login-link' onClick={onLoginClick}>Login</a>
      </div>
    );
  }

  static get propTypes () {
    return {
      onRegister: React.PropTypes.func,
      onLogin: React.PropTypes.func
    };
  }
}

export default RegisterAndLoginInvitation;
