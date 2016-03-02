
import { default as React } from "react";

import { default as UserHeader } from "./userHeader";

export default class HeaderContainer extends React.Component {
    // <SearchWidget attr={ this.props.attr }/>
    render() {
        return (
            <div className="g-app-header-container">
              <div className="g-header-wrapper">
                <div className="g-app-title">Girder</div>
                <UserHeader user={ this.props.user }/>
                <div className="g-clear-both"/>
              </div>
            </div>
        );
    }
}

