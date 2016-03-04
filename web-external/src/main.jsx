
import "babel-polyfill";

import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";

import { partial, isArray } from "underscore";

import MainApp from "./components/main-app";
import FrontPage from "./components/front-page";

import style from "./style/full-viewport";

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
        type: rootReducer().globalNav.list.extend,
        entries: [
            /* id  name           icon       target */
            [0, "Collections", "sitemap", "collections"],
            [1, "Users"      , "user"   , "users"      ],
            [2, "INDEX"      , "user"   , ""           ],
            [3, "Groups"     , "users"  , "groups"     ],
            [4, "INDEX"      , "user"   , ""           ]
        ].map(([id, name, icon, target]) => ({
            id,
            value: { name, icon, target }
        }))
    });

    store.dispatch({
        type: rootReducer().globalNav.table.set,
        entries: {
            /* [target]: [component] */
            ""         : FrontPage,
            collections: dummy("Collections Test"),
            users      : dummy("Users Test"      ),
            groups     : dummy("Groups Test"     )
        }
    });

    /* initialize rest API */
    let { default: events } = require("./utils/events");
    let { default: restRequests } = require("./utils/rest-requests");

    const rest = restRequests({ events, apiRoot });

    /* define some function to be used for routing */

    /* :target/a/b/c/etc... -> sets global nav target */
    const setGlobalNavTarget = ({ params: { target } }, next) => {
        store.dispatch({
            type: rootReducer().globalNav.currentTarget.set,
            value: target
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

    /* expose some variables for debugging */
    Object.assign(window, { store, rootReducer });
});

