import React from 'react';

import Link from './link';

class LinkGroup extends React.Component {
  render () {
    let {
      groupMembership,
      horizontalOffset,
      links,
      onClick,
      pathString,
      strokeWidth
    } = this.props;

    return (
      <g className='group'
         transform={ `translate(${ horizontalOffset }, 0)` }>
        {
          links.map((link, i) => (
            <Link groupMembership={ groupMembership(link, i) }
                  onClick={ (e) => onClick(link, e) }
                  pathString={ pathString(link, i) }
                  strokeWidth={ strokeWidth(link, i) }
                  key={ i }/>
          ))
        }
      </g>
    );
  }

  static get propTypes () {
    return {
      groupMembership: React.PropTypes.func,
      horizontalOffset: React.PropTypes.number,
      links: React.PropTypes.array,
      onClick: React.PropTypes.func,
      pathString: React.PropTypes.func,
      strokeWidth: React.PropTypes.func
    };
  }
}

export default LinkGroup;
