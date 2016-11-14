import React from 'react';

import BodyContainer from './containers/body';
import FooterContainer from './containers/footer';
import GlobalNavContainer from './containers/global-nav';
import HeaderContainer from './containers/header';

class MainApp extends React.Component {
  render () {
    let { dialogComponentKey } = this.props;

    let dialogEnabled = !!(dialogComponentKey);

    return (
      <div className={ dialogEnabled ? 'modal-open' : null }>
        <HeaderContainer/>
        <GlobalNavContainer/>
        <BodyContainer/>
        <FooterContainer/>
      </div>
    );

    /*
     * NOTE(opadron): We can probably do away with these views/revisit them
     *                later.
     */
    // <div id='g-app-progress-container'/>
    // <div id='g-alerts-container'/>
  }

  static get defaultProps () {
    return { dialogComponentKey: null };
  }

  static get propTypes () {
    return { dialogComponentKey: React.PropTypes.string };
  }
}

export default MainApp;
