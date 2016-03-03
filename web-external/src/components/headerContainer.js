
import { default as React } from "react";
import { partial } from "underscore";

import { default as UserHeader } from "./userHeader";

export default class HeaderContainer extends React.Component {
    // <SearchWidget attr={ this.props.attr }/>
    render() {
        return (
            <div id="g-app-header-container">
              <div className="g-header-wrapper">
                <div className="g-app-title"
                   onClick={ partial(this.props.navigationCallback, "") }>
                  Girder
                </div>
                <UserHeader currentUser={ this.props.currentUser }/>
                <div className="g-clear-both"/>
              </div>
            </div>
        );
    }
}

