
import { default as React } from "react";

import { default as Header } from "./frontPageHeader";
import { default as Body } from "./frontPageBody";

export default class FrontPage extends React.Component {
    render() {
        return (
            <div id="g-app-body-container" className="g-default-layout">
              <Header staticRoot={ this.props.staticRoot }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
              <Body apiRoot={ this.props.apiRoot }
                    user={ this.props.user }/>
            </div>
        );
    }
}

