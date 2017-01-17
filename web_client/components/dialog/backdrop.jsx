import React from 'react';

class Backdrop extends React.Component {
  render () {
    let { enabled } = this.props;
    return (
      enabled ? <div className='modal-backdrop fade in'/> : null
    );
  }

  static get propTypes () {
    return { enabled: React.PropTypes.bool };
  }
}

export default Backdrop;
