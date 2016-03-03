
import { default as $ } from "jquery";
import { default as React } from "react";
import { default as ReactDOM } from "react-dom";

import { default as FrontPage } from "./components/frontPage";
import { default as App } from "./components/mainApp";

import "./components/fullViewPort";

class TestBodyComponent extends React.Component {
    render() {
        return (
            <div id="g-app-body-container" className="g-default-layout">
              Hello, SUMO!
            </div>
        );
    }
}

class IndexTestBodyComponent extends React.Component {
    render() {
        return (
            <div id="g-app-body-container" className="g-default-layout">
              INDEX TEST
            </div>
        );
    }
}

class CollectionsTestBodyComponent extends React.Component {
    render() {
        return (
            <div id="g-app-body-container" className="g-default-layout">
              COLLECTIONS TEST
            </div>
        );
    }
}

class UsersTestBodyComponent extends React.Component {
    render() {
        return (
            <div id="g-app-body-container" className="g-default-layout">
              USERS TEST
            </div>
        );
    }
}

class GroupsTestBodyComponent extends React.Component {
    render() {
        return (
            <div id="g-app-body-container" className="g-default-layout">
              GROUPS TEST
            </div>
        );
    }
}

function createMainApp(element, navItems, navMap, navCB) {
    var reference;
    var component = (<App apiRoot="api/v1"
                          staticRoot="static"
                          user={ null || "girder" }
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

    var app = createMainApp(
        $div[0],
        [{name: 'Collections', icon: 'icon-sitemap', target: 'collections'},
         {name: 'Users'      , icon: 'icon-user'   , target: 'users'      },
         {name: 'INDEX'      , icon: 'icon-user'   , target: ''           },
         {name: 'Groups'     , icon: 'icon-users'  , target: 'groups'     },
         {name: 'INDEX'      , icon: 'icon-user'   , target: ''           }
         ],
        {
            test: TestBodyComponent,
            "": FrontPage,
            collections: CollectionsTestBodyComponent,
            users: UsersTestBodyComponent,
            groups: GroupsTestBodyComponent
        },
        path => path
    );

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

