import React from 'react';

class Footer extends React.Component {
  render () {
    let {
      onClose,
      onSubmit
    } = this.props;

    return (
      <div className='modal-footer'>
        <a
          className='btn btn-default'
          data-dismiss='modal'
          onClick={onClose}
        >
          Close
        </a>
        <button
          className='btn btn-primary'
          id='g-register-button'
          type='submit'
          onClick={onSubmit}
        >
          <i className='icon-plus-circled' />
          Register
        </button>
      </div>
    );
  }

  static get propTypes () {
    return {
      onClose: React.PropTypes.func,
      onSubmit: React.PropTypes.func
    };
  }
}

export default Footer;
