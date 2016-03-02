
import { default as React } from "react";

// import { default as Info } from "./footerInfo";

export default class FrontPage extends React.Component {
    render() {
        return (
            <div className="g-global-nav-main">
              <ul className="g-global-nav">
                <Links apiRoot={ this.props.apiRoot }/>
                <Info />
              </ul>
            </div>
        )
    }
}

