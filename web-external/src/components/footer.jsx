import React from 'react';

import Links from './footer/links';
import Info from './footer/info';

export default class Footer extends React.Component {
  render () {
    let { apiRoot } = this.props;

    return (
      <div id='g-app-footer-container'>
        <Links apiRoot={ apiRoot }/>
        <Info/>
      </div>
    );
  }
}
