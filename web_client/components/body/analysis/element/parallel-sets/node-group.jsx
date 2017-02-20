import React from 'react';

import Node from './node';

class NodeGroup extends React.Component {
  render () {
    let {
      fill,
      groupMembership,
      height,
      horizontalOffset,
      nodes,
      onClick,
      verticalOffset,
      width
    } = this.props;

    return (
      <g
        className='group'
        transform={`translate(${horizontalOffset}, 0)`}
      >
        {
          nodes.map((node, i) => (
            <Node
              fill={fill(node, i)}
              groupMembership={groupMembership(node, i)}
              height={height(node, i)}
              onClick={(e) => onClick(node, e)}
              verticalOffset={verticalOffset(node, i)}
              width={width(node, i)}
              key={i}
            />
          ))
        }
      </g>
    );
  }

  static get propTypes () {
    return {
      fill: React.PropTypes.func,
      groupMembership: React.PropTypes.func,
      height: React.PropTypes.func,
      horizontalOffset: React.PropTypes.number,
      nodes: React.PropTypes.array,
      onClick: React.PropTypes.func,
      verticalOffset: React.PropTypes.func,
      width: React.PropTypes.func
    };
  }
}

export default NodeGroup;
