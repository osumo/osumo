
import "babel-polyfill";

import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";

import { partial, isArray } from "underscore";

import MainApp from "./components/mainApp";
import FrontPage from "./components/frontPage";

import styles from "./style/fullViewPort";

const DummyComponent = ({ msg }) => (
    <div id="g-app-body-container" className="g-default-layout">
      { msg }
    </div>);

$(() => {
    /* define some constants here */
    /* TODO(opadron): Is there a better place for these? */
    const apiRoot = "api/v1";
    const staticRoot = "static";

    /* create store and populate it with initial state */
    let { default: rootReducer } = require("./reducer");
    const store = createStore(rootReducer);

    const dummy = (msg) => partial(DummyComponent, { msg });

    store.dispatch({
        type: "ADD_GLOBAL_NAV",
        items: [
            { name: "Collections", icon: "sitemap", target: "collections" },
            { name: "Users"      , icon: "user"   , target: "users"       },
            { name: "INDEX"      , icon: "user"   , target: ""            },
            { name: "Groups"     , icon: "users"  , target: "groups"      },
            { name: "INDEX"      , icon: "user"   , target: ""            }
        ]
    });

    store.dispatch({
        type: "SET_GLOBAL_NAV_TARGET",
        mappings: {
            /* [target]: [component] */
            ""         : FrontPage,
            collections: dummy("Collections Test"),
            users      : dummy("Users Test"      ),
            groups     : dummy("Groups Test"     )
        }
    });

    /* initialize rest API */
    let { default: events } = require("./utils/events");
    let { default: restRequests } = require("./utils/restRequests");

    const rest = restRequests({ events, apiRoot });

    /* define some function to be used for routing */

    /* :target/a/b/c/etc... -> sets global nav target */
    const setGlobalNavTarget = ({ params: { target } }, next) => {
        store.dispatch({
            type: "SET_CURRENT_GLOBAL_NAV_TARGET",
            target
        });
        next();
    };

    /* like above, but hardcoded for the main page */
    const setGlobalNavTargetToIndex = (_, next) => setGlobalNavTarget(
        { params: { target: "" } },
        next
    );

    /* :target/... -> checks target for special values before passing along */
    const handleSpecialNavTarget = ({ params: { target } }, next) => {
        if(target === "login") {
            console.log("LOGIN");
        } else if(target === "logout") {
            rest.logout();
        } else if(target === "register") {
            console.log("REGISTER");
        } else {
            next();
        }
    };

    let targetMiddleWare = [
        handleSpecialNavTarget,
        setGlobalNavTarget
    ];

    /* create the router, mount middleware, and start routing */
    let { default: router } = require("./utils/router");
    let route = router();

    route("", setGlobalNavTargetToIndex);
    route(":target", ...targetMiddleWare);

    route.base();
    route.pushState(false);
    route.start();

    let $div;
    $(document.body).append($div = $("<div>").attr("id", "root"));

    /* create main application component and render */
    let { default: reduxComponent } = require("./utils/redux-component");
    let App = reduxComponent(
        store,
        (
            {
                globalNav: {
                    currentTarget,
                    list: navList,
                    table: navTable
                },
                currentUser
            },
            dispatch
        ) => (
            <MainApp apiRoot="api/v1"
                     currentTarget={ currentTarget }
                     currentUser={ currentUser }
                     navList={ navList }
                     navTable={ navTable }
                     staticRoot="static"

                     onCollections={ () => route("collections") }
                     onFolders={ (id) => route(`user/${ id }`) }
                     onInfo={ (id) => route(`useraccount/${ id }/info`) }
                     /* TODO(opadron): add a login handler */
                     /* onLogin={ ... } */
                     onLogout={ (id) => route(`useraccount/${ id }/logout`) }
                     onNavigate={ (target) => route(target) }
                     /* TODO(opadron): what to do about the search bar? */
                     /* onQuickSearch={ ... } */
                     onRegister={ () => route("register") }
                     onTitle={ () => route("") }/>
        )
    );

    ReactDOM.render(<App/>, $div[0]);
});

