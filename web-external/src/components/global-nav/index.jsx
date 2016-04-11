import React from 'react';

import List from './list';

import propTypes from '../../prop-types';

class GlobalNav extends React.Component {
  render () {
    let {
      navList,
      currentTarget,
      onNavigate
    } = this.props;

    return (
      <div id='g-global-nav-container'>
      <List navList={ navList }
        currentTarget={ currentTarget }
        onNavigate={ onNavigate }/>
      <div className='g-global-nav-fade'/>
      </div>
    );
  }

  static get propTypes () {
    return {
      currentTarget: propTypes.currentTarget,
      navList: propTypes.navList,
      onNavigate: propTypes.onNavigate
    };
  }
}

export default GlobalNav;
