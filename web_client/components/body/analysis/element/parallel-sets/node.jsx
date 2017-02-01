import React from 'react';

class Node extends React.Component {
  render () {
    let {
      fill,
      groupMembership,
      height,
      onClick,
      verticalOffset,
      width
    } = this.props;

    const inAnyGroup = (groupMembership.some((x) => x));

    const className = (
      [
        groupMembership[0] ? 'black' : '',
        groupMembership[1] ? 'red' : '',
        inAnyGroup ? 'box' : ''
      ]
      .filter((frag) => frag.length)
      .join(' ')
    );

    return (
      <g className='node'>
        <rect
          className={className}
          fill={fill}
          y={verticalOffset}
          width={width}
          height={height}
          onClick={onClick}
        />
      </g>
    );
  }

  static get propTypes () {
    return {
      fill: React.PropTypes.string,
      groupMembership: React.PropTypes.array,
      height: React.PropTypes.number,
      onClick: React.PropTypes.func,
      verticalOffset: React.PropTypes.number,
      width: React.PropTypes.number
    };
  }
}

export default Node;
