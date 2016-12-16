import React from 'react';
import Header from '../common/header';
import FormEntry from './form-entry';
import Body from './body';
import Footer from './footer';
import Explanation from './explanation';
import RegisterAndLoginInvitation from './register-and-login-invitation';

class ResetPassword extends React.Component {
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
      onLogin,
      onRegister,
      onUpdate,
      onClose,
      onSubmit,
      errorKey,
      errorMessage,
      focusField,
      focusTime,
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
        key: 'email',
        errorCheckKey: 'email',
        placeholder: 'Enter your email',
        text: 'Email'
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
                id='g-reset-password-form'
                role='form'
                onSubmit={ (event) => event.preventDefault() }>
            <Header onClose={ onClose }>Forgotten password</Header>
            <Body>
              <Explanation/>
              { formEntries }
              { validationFailed }
              <RegisterAndLoginInvitation key='login-invitation'
                                          onRegister={ onRegister }
                                          onLogin={ onLogin }/>
            </Body>

            <Footer onClose={ onClose } onSubmit={ onSubmit }/>
          </form>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      focusField: React.PropTypes.string,
      focusTime: React.PropTypes.object,
      errorKey: React.PropTypes.string,
      errorMessage: React.PropTypes.string,
      form: React.PropTypes.objectOf(React.PropTypes.string),
      onClose: React.PropTypes.func,
      onLogin: React.PropTypes.func,
      onRegister: React.PropTypes.func,
      onSubmit: React.PropTypes.func,
      onUpdate: React.PropTypes.func
    };
  }
}

export default ResetPassword;
