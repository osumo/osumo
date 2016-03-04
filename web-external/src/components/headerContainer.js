
import React from "react";
import { partial } from "underscore";

import UserHeader from "./userHeader";

export default class HeaderContainer extends React.Component {
    // <SearchWidget attr={ this.props.attr }/>
    render() {
        let { currentUser, navigationCallback } = this.props;
        return (
            <div id="g-app-header-container">
              <div className="g-header-wrapper">
                <div className="g-app-title"
                   onClick={ partial(navigationCallback, "") }>
                  Girder
                </div>
                <UserHeader currentUser={ currentUser }/>
                <div className="g-clear-both"/>
              </div>
            </div>
        );
    }
}

