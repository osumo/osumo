import React from 'react';
import { TIMES } from '../../../constants';

class Header extends React.Component {
  render () {
    let { onClose } = this.props;
    return (
      <div className='modal-header'>
        <button
          className='close'
          data-dismiss='modal'
          aria-hidden='true'
          type='button'
          onClick={onClose}
        >
          {TIMES}
        </button>
        <h4 className='modal-title'>{this.props.children}</h4>
      </div>
    );
  }

  static get propTypes () {
    return {
      onClose: React.PropTypes.func,
      children: React.PropTypes.string
    };
  }
}

export default Header;
