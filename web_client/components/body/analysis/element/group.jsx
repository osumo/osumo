import React from 'react';

class Group extends React.Component {
  render () {
    let { children } = this.props;
    return <div>{children}</div>;
  }
}

export default Group;
