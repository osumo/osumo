
import { default as React } from "react";

import { default as List } from "./globalNavList";

export default class GlobalNavContainer extends React.Component {
    render() {
        return (
            <div id="g-global-nav-container">
              <List navItems={ this.props.navItems }/>
              <div className="g-global-nav-fade"/>
            </div>
        );
    }
}

