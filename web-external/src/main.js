
import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import { partial, isArray } from "underscore";
import { createStore } from "redux";

import FrontPage from "./components/frontPage";
import App from "./components/mainApp";
import styles from "./components/fullViewPort";

import router from "./router";
import rootReducer from "./reducer";
import restRequests from "./utils/restRequests";
import events from "./utils/events";

const DummyComponent = ({ msg }) => (
    <div id="g-app-body-container" className="g-default-layout">
      { msg }
    </div>);

$(() => {

    const dummy = (msg) => partial(DummyComponent, { msg });
    const store = createStore(rootReducer);

    store.dispatch({
        type: "ADD_GLOBAL_NAV",
        items: [
            /* [name]       [icon]     [target]    */
            ["Collections", "sitemap", "collections"],
            ["Users"      , "user"   , "users"      ],
            ["INDEX"      , "user"   , ""           ],
            ["Groups"     , "users"  , "groups"     ],
            ["INDEX"      , "user"   , ""           ]
        ].map(([name, icon, target]) => ({ name, icon, target }))
    });

    store.dispatch({
        type: "SET_GLOBAL_NAV_TARGET",
        mappings: {
            ""         : FrontPage,
            collections: dummy("Collections Test"),
            users      : dummy("Users Test"      ),
            groups     : dummy("Groups Test"     )
        }
    });

    let $div;
    $(document.body).append($div = $("<div>").attr("id", "root"));

    let route = router();
    let onNavigate = path => route(path);

    let app;

    const setTarget = ({ params: { target } }, next) => {
        store.dispatch({
            type: "SET_CURRENT_GLOBAL_NAV_TARGET",
            target
        });
        next();
    };

    const REST = restRequests({
        events,
        apiRoot: "api/v1"
    });

    const handleSpecialTarget = ({ params: { target } }, next) => {
        if(target === "login") {
            console.log("LOGIN");
        } else if(target === "logout") {
            REST.logout();
        } else if(target === "register") {
            console.log("REGISTER");
        } else {
            next();
        }
    };

    let targetMiddleWare = [handleSpecialTarget,
                            setTarget];

    route("", (_, next) => setTarget({ params: { target: "" } }, next));

    route(":target", ...targetMiddleWare);
    route(":target/:extra/*nested", ...targetMiddleWare, ({ params }) => {
        console.log("NESTED ROUTE:")
        console.log(params);
    });

    route.base();
    route.pushState(false);
    route.start();
});

