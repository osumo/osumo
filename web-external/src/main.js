
import { default as $ } from "jquery";
import { default as React } from "react";
import { default as ReactDOM } from "react-dom";

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

$(() => {

    var $div;
    $(document.body).append($div = $("<div>"));
    var navItems = [{name: 'Collections',
                     icon: 'icon-sitemap',
                     target: 'collections'},

                    {name: 'Users',
                     icon: 'icon-user',
                     target: 'users'},

                    {name: 'Groups',
                     icon: 'icon-users',
                     target: 'groups'}];

    var bodyMap = {
        test: TestBodyComponent
    };

    ReactDOM.render(window.app = <App apiRoot="api/v1"
                                      navItems={ navItems }
                                      bodyMap={ bodyMap }/>, $div[0]);

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

