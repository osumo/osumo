
import { default as React } from "react";

import { default as Header } from "./headerContainer";
import { default as Footer } from "./footerContainer";
import { default as GlobalNav } from "./globalNavContainer";

class DummyBodyComponent extends React.Component {
    render() {
        return <div id="g-app-body-container" className="g-default-layout"/>;
    }
}

export default class MainApp extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = { bodyKey: false };
    }

    navigateTo(key) {
        this.setState({ bodyKey: key });
    }

    render() {
        var BodyComponent = (
            this.props.bodyMap[this.state.bodyKey] || DummyBodyComponent);

        /*
         * NOTE(opadron): We can probably do away with the other views/revisit
         *                them later.
         */
        return (
            <div>
              <Header user={ this.props.user }/>
              <GlobalNav navItems={ this.props.navItems }/>
              <BodyComponent/>
              <Footer apiRoot="api/v1"/>
              <div id="g-app-progress-container"/>
              <div id="g-dialog-container" className="modal fade"/>
              <div id="g-alerts-container"/>
            </div>
        );
    }
}

