import React from 'react';
import Root from './root';
import Group from '../common/group';

class GlobalNav extends React.Component {
  render () {
    let {
      filterKey,
      children,
      onChildClick
    } = this.props;

    return (
      <Group
        root={<Root />}
        filterKey={filterKey}
        onChildClick={onChildClick}
        onlyMatching={false}
      >
        {children}
      </Group>
    );
  }

  static get propTypes () {
    return {
      filterKey: React.PropTypes.string,
      children: React.PropTypes.oneOfType([
        React.PropTypes.oneOf([null]),
        React.PropTypes.element,
        React.PropTypes.arrayOf(React.PropTypes.element)
      ]),
      onChildClick: React.PropTypes.func
    };
  }
}

export default GlobalNav;
