
/* TODO(opadron): still need to switch this to React */

import { default as App } from "./views/app";

export default Backbone.Router.extend({
    initialize: function(params) {
        this.appView = params.appView || new App(params);

        this.on("route:defaultRoute", (...args) => {
            console.log("Hello, Backbone");
            console.log(`args: (${args.length})`);
            args.forEach((x) => { console.log(x); });

            this.appView.render();
        });
    },

    routes: {
        "*actions": "defaultRoute"
    }
});

