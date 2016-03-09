import React from 'react';

import Links from './footer/links';
import Info from './footer/info';

class Footer extends React.Component {
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

Footer.propTypes = {
  apiRoot: React.PropTypes.string.isRequired
};

export default Footer;
