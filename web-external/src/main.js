
import { Enumerator } from "./es2015-test";
import "./body-darkred";
import { default as jade } from "./div.jade";
import { default as $ } from "jquery";

$(() => {
    console.log("Hello, World!");
    var e = new Enumerator([0, 1, 2, 3, 4, 5]);
    e.showEvens();
    (function() {
        [1, 2, 3].forEach(x => this.showOdds());
    }).apply(e, []);

    $(document.body).append($(jade()));
});

