
import { default as React } from "react";

import { default as Links } from "./footerLinks";
import { default as Info } from "./footerInfo";

export default class FooterContainer extends React.Component {
    render() {
        return (
            <div id="g-app-footer-container">
              <Links apiRoot={ this.props.apiRoot }/>
              <Info/>
            </div>
        )
    }
}

