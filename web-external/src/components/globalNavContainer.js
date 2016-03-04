
import React from "react";

import List from "./globalNavList";

export default class GlobalNavContainer extends React.Component {
    render() {
        return (
            <div id="g-global-nav-container">
              <List navItems={ this.props.navItems }
                    activeItem={ this.props.activeItem }
                    onNavigate={ this.props.onNavigate }/>
              <div className="g-global-nav-fade"/>
            </div>
        );
    }
}

