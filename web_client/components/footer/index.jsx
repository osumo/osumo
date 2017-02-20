import React from 'react';

import Links from './links';
import Info from './info';

class Footer extends React.Component {
  render () {
    let { apiRoot } = this.props;

    return (
      <div id='g-app-footer-container'>
        <Links apiRoot={apiRoot} />
        <Info />
      </div>
    );
  }

  static get propTypes () {
    return { apiRoot: React.PropTypes.string };
  }
}

export default Footer;
