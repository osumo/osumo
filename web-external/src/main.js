
import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import _ from "underscore";

import FrontPage from "./components/frontPage";
import App from "./components/mainApp";
import styles from "./components/fullViewPort";

import router from "./router";
import restRequests from "./utils/restRequests";
import events from "./utils/events";

const DummyComponent = ({ msg }) => (
    <div id="g-app-body-container" className="g-default-layout">
      { msg }
    </div>);

function createMainApp(element, navItems, navMap, navCB) {
    var reference;
    var component = (<App apiRoot="api/v1"
                          staticRoot="static"
                          currentUser={ null || "girder" }
                          navigationCallback={ navCB }
                          navItems={ navItems }
                          navMap={ navMap }
                          ref={(ref) => reference = ref}/>);

    ReactDOM.render(component, element);

    var result = {component: component,
                  reference: reference};

    return result;
}

$(() => {

    var $div;
    $(document.body).append($div = $("<div>"));

    let route = router();

    var app = createMainApp(
        $div[0],
        [{name: 'Collections', icon: 'icon-sitemap', target: 'collections'},
         {name: 'Users'      , icon: 'icon-user'   , target: 'users'      },
         {name: 'INDEX'      , icon: 'icon-user'   , target: ''           },
         {name: 'Groups'     , icon: 'icon-users'  , target: 'groups'     },
         {name: 'INDEX'      , icon: 'icon-user'   , target: ''           }
         ],
        {

            test       : dummy("TEST"),
            ""         : FrontPage,
            collections: dummy("Collections Test"),
            users      : dummy("Users Test"      ),
            groups     : dummy("Groups Test"     )
        },
        path => route(path)
    );

    const REST = restRequests({
        events,
        apiRoot: "api/v1"
    });

    function setNavKey(context, next) {
        var navKey = context.params.navKey || "";
        app.reference.setState({ navKey: navKey });
        next();
    }

    route("", setNavKey, () => {
        console.log("INIT");
    });

    route(":navKey", setNavKey, () => {
        console.log("INIT");
    });

    route(":navKey/:extra/*nested", setNavKey, (context) => {
        console.log("NESTED ROUTE:")
        console.log(context.params);
    });

    route.base();
    route.pushState(false);
    route.start();
    // girder.apiRoot = "/girder/api/v1";
    // girder.router.enabled(false);

    // var app = new App({ el: "body", parentView: null });
    // var router = new Router({ appView: app });
    // Backbone.history.start({ pushState: false });




    // router.on("route", onRoute);

    // girder.router.route('', 'index', () => {
    //     girder.events.trigger('g:navigateTo', views.FrontPage);
    // });


/*
    girder.mainApp = new views.App({
        el: "body",
        parentView: null
    });

    girder.views.WorkspacesView = views.Workspaces;
    girder.router.route('workspaces', 'workspaces', (params) => {
        console.log(params);
        girder.events.trigger('g:navigateTo', views.Workspaces, params || {});
        girder.events.trigger('g:highlightItem', 'WorkspacesView');
    });
*/

});

