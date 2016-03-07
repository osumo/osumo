import React from 'react';
import { partial } from 'underscore';

export default class List extends React.Component {
  render () {
    let {
      currentTarget,
      navList,
      onNavigate
    } = this.props;

    let navItems = navList.map(({ id, value: { icon, name, target } }) => {
      let className = currentTarget === target
        ? 'g-global-nav-li g-active'
        : 'g-global-nav-li';

      let clickHandler = partial(onNavigate, target);

      return (
        <li className={ className } key={ id }>
          <a className='g-nav-link'
             g-target={ target }
             g-name={ name }
             onClick={ clickHandler } >
            <i className={ icon }></i>
            <span>{ name }</span>
          </a>
        </li>
      );
    });

    return (
      <div className='g-global-nav-main'>
        <ul className='g-global-nav'>
          { navItems }
        </ul>
      </div>
    );
  }
}
