import React from 'react';

class Entry extends React.Component {
  render () {
    let {
      groupKey,
      filterKey,
      icon,
      name,
      onClick
    } = this.props;

    let isActive = (groupKey === filterKey);
    let className = (isActive ? 'g-global-nav-li g-active' : 'g-global-nav-li');

    if (isActive) {
      onClick = () => null;
    }

    return (
      <li className={ className }>
        <a className='g-nav-link'
           g-target={ groupKey }
           g-name={ name }
           onClick={ onClick } >
          <i className={ icon }></i>
          <span>{ name }</span>
        </a>
      </li>
    );
  }

  static get propTypes () {
    return {
      groupKey: React.PropTypes.string,
      filterKey: React.PropTypes.string,
      icon: React.PropTypes.string,
      name: React.PropTypes.string,
      onClick: React.PropTypes.func
    };
  }
}

export default Entry;
