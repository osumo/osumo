
import React from "react";

import Header from "./headerContainer";
import GlobalNav from "./globalNavContainer";
import Footer from "./footerContainer";

class DummyBodyComponent extends React.Component {
    render() {
        return <div id="g-app-body-container" className="g-default-layout"/>;
    }
}

export default class MainApp extends React.Component {

    static defaultProps = {
        apiRoot: "api/v1",
        staticRoot: "static",
        currentUser: null,
        navItems: [],
        navMap: {},
        /* TODO(opadron): replace with a warning message */
        onNavigate: (route) => console.log("ROUTE: " + route)
    };

    state = {};

    render() {
        var BodyComponent = (
            this.props.navMap[this.state.navKey] || DummyBodyComponent);

        var body = (
            BodyComponent === DummyBodyComponent
          ? <BodyComponent/>
          : <BodyComponent key={ this.state.navKey }
                           apiRoot={ this.props.apiRoot }
                           staticRoot={ this.props.staticRoot }
                           onNavigate={ this.props.onNavigate }
                           currentUser={ this.props.currentUser }/>);

        /*
         * NOTE(opadron): We can probably do away with the other views/revisit
         *                them later.
         */
        return (
            <div>
              <Header currentUser={ this.props.user }
                      onNavigate={ this.props.onNavigate }/>
              <GlobalNav navItems={ this.props.navItems }
                      onNavigate={ this.props.onNavigate }
                      activeItem={ this.state.navKey }/>
              { body }
              <Footer apiRoot="api/v1"/>
              <div id="g-app-progress-container"/>
              <div id="g-dialog-container" className="modal fade"/>
              <div id="g-alerts-container"/>
            </div>
        );
    }
}

