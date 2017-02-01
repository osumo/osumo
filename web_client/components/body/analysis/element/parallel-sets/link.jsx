import React from 'react';

class Link extends React.Component {
  render () {
    let {
      groupMembership,
      onClick,
      pathString,
      strokeWidth
    } = this.props;

    const className = (
      [
        'link',
        groupMembership[0] ? 'two' : '',
        groupMembership[1] ? 'one' : ''
      ]
      .filter((frag) => frag.length)
      .join(' ')
    );

    return (
      <path
        className={className}
        style={{ strokeWidth }}
        d={pathString}
        onClick={onClick}
      />
    );
  }

  static get propTypes () {
    return {
      groupMembership: React.PropTypes.array,
      onClick: React.PropTypes.func,
      pathString: React.PropTypes.string,
      strokeWidth: React.PropTypes.number
    };
  }
}

export default Link;
