import React from 'react';

class Root extends React.Component {
  render () {
    let { children } = this.props;

    return (
      <div id='g-global-nav-container'>
        <div className='g-global-nav-main'>
          <ul className='g-global-nav'>
            { children }
          </ul>
        </div>
      </div>
    );
  }

  static get propTypes () {
    return {
      children: React.PropTypes.oneOfType([
        React.PropTypes.oneOf([null]),
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.element)
      ])
    };
  }
}

export default Root;
