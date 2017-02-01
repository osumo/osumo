import React from 'react';
import { NBSP } from '../../../constants';

class RegisterInvitation extends React.Component {
  render () {
    let {
      onForgottenPassword,
      onRegister
    } = this.props;

    const onRegisterClick = (event) => {
      event.preventDefault();
      onRegister();
    };

    const onForgotPasswordClick = (event) => {
      event.preventDefault();
      onForgottenPassword();
    };

    const registerHere = (
      <a className='g-register-link' onClick={onRegisterClick} key='1'>
        Register here.
      </a>
    );

    const forgotYourPassword = (
      <a
        className='g-forgot-password'
        onClick={onForgotPasswordClick}
        key='2'
      >
        Forgot your password?
      </a>
    );

    return (
      <div className='g-bottom-message' key='0'>
        {'Don\'t have an account yet?'}
        {NBSP}
        {registerHere}
        {' | '}
        {forgotYourPassword }
      </div>
    );
  }

  static get propTypes () {
    return {
      onForgottenPassword: React.PropTypes.func,
      onRegister: React.PropTypes.func
    };
  }
}

export default RegisterInvitation;
