import React from 'react';
import Header from '../common/header';
import FormEntry from './form-entry';
import Body from './body';
import Footer from './footer';
import RegisterInvitation from './register-invitation';

class Login extends React.Component {
  constructor () {
    super();
    this.state = this.state || {};
    this.state.lastFocusTime = null;
    this.state.focusNeedsUpdate = true;
  }

  componentWillReceiveProps (newProps) {
    let focusNeedsUpdate = (
      this.state.lastFocusTime < newProps.focusTime ||
      (!this.state.lastFocusTime && newProps.focusTime)
    );

    this.setState({ focusNeedsUpdate, lastFocusTime: newProps.focusTime });
  }

  render () {
    let {
      onUpdate,
      onClose,
      onForgottenPassword,
      onRegister,
      onSubmit,
      errorKey,
      errorMessage,
      focusTime,
      focusField,
      form
    } = this.props;

    let { focusNeedsUpdate } = this.state;

    let updateCallback = (key) => (value) => {
      let payload = {};
      payload[key] = value;
      return onUpdate(payload);
    };

    let validationFailed = [];
    let formEntries = [
      {
        key: 'login',
        errorCheckKey: 'login',
        placeholder: 'Enter login',
        text: 'Login or email'
      },
      {
        key: 'password',
        errorCheckKey: 'password',
        placeholder: 'Enter password',
        type: 'password',
        text: 'Password'
      }
    ];

    formEntries = formEntries.map((props) => {
      let {key, errorCheckKey, placeholder, text, ...rest} = props;
      let className = null;
      if (errorMessage && errorCheckKey === errorKey) {
        className = 'has-error';
      }

      let fTime = ((key === focusField && focusNeedsUpdate) ? focusTime : null);

      return (
        <FormEntry className={ className }
                   groupId={ `g-group-${key}` }
                   id={ `g-${key}` }
                   placeholder={ placeholder }
                   key={ key }
                   onChange={ updateCallback(key) }
                   value={ form[key] }
                   focusTime={ fTime }
                   {...rest}>
          { text }
        </FormEntry>
      );
    });

    if (errorMessage) {
      validationFailed = [
        <div key='validation-failed' className='g-validation-failed-message'>
          { errorMessage }
        </div>
      ];
    }

    return (
      <div className='modal-dialog'>
        <div className='modal-content'>
          <form className='modal-form'
                id='g-login-form'
                role='form'
                onSubmit={ (event) => event.preventDefault() }>
            <Header onClose={ onClose }>Log in</Header>
            <Body>
              { formEntries }
              { validationFailed }
              <RegisterInvitation key='register-invitation'
                                  onRegister={ onRegister }
                                  onForgottenPassword={ onForgottenPassword }/>
            </Body>

            <Footer onClose={ onClose } onSubmit={ onSubmit }/>
          </form>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      errorKey: React.PropTypes.string,
      errorMessage: React.PropTypes.string,
      focusField: React.PropTypes.string,
      focusTime: React.PropTypes.object,
      form: React.PropTypes.objectOf(React.PropTypes.string),
      onClose: React.PropTypes.func,
      onForgottenPassword: React.PropTypes.func,
      onRegister: React.PropTypes.func,
      onSubmit: React.PropTypes.func,
      onUpdate: React.PropTypes.func
    };
  }
}

export default Login;
