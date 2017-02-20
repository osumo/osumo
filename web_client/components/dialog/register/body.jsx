import React from 'react';

class Body extends React.Component {
  render () {
    return (
      <div className='modal-body'>
        { this.props.children }
      </div>
    );
  }

  static get propTypes () {
    return {
      children: React.PropTypes.oneOfType([
        React.PropTypes.oneOf([null]),
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.any)
      ])
    };
  }
}

export default Body;
