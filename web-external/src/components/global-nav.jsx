import React from 'react';

import List from './global-nav/list';

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
}

GlobalNav.propTypes = {
  navList: React.PropTypes.string.isRequired,
  currentTarget: React.PropTypes.string.isRequired,
  onNavigate: React.PropTypes.string.isRequired
};

export default GlobalNav;
