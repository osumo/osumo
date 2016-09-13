import React from 'react';
import Group from '../common/group';

class Body extends React.Component {
  render () {
    let { children, filterKey } = this.props;

    return (
      <Group className='g-default-layout'
             id='g-app-body-container'
             filterKey={ filterKey }>
        { children }
      </Group>
    );
  }

  static get propTypes () {
    return {
      children: React.PropTypes.oneOfType([
        React.PropTypes.oneOf([null]),
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.element)
      ]),
      filterKey: React.PropTypes.string
    };
  }
}

export default Body;
