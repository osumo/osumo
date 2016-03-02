
/* jshint node: true */

module.exports = function (grunt) {

    var path = require('path');

    // This gruntfile is only designed to be used with girder's build system.
    // Fail if grunt is executed here.
    if (path.resolve(__dirname) === path.resolve(process.cwd())) {
        grunt.fail.fatal(
            "To build Osumo, run grunt from Girder's root directory");
    }

    var fs = require('fs');
    var webpack = null;
    try { webpack = require("webpack"); } catch (e) { }

    if(webpack === null) {
        grunt.log.writeln('webpack unavailable.'.yellow);
        grunt.log.writeln([
            'grunt configuration'.yellow.underline,
            'will not be set this run.'.yellow].join(" "));

        return;
    }

    grunt.config.merge({
        shell: {
            "osumo-webpack": {
                command: ["./node_modules/webpack/bin/webpack.js",
                          "--display-error-details"].join(" "),
                options: {
                    execOptions: {
                        cwd: path.join("plugins", "osumo"),
                    }
                }
            }
        },

        watch: {
            "plugin-osumo-webpack": {
                files: [path.join(__dirname, "web-external", "src", "**", "*"),
                        path.join(__dirname, "Gruntfile.js"),
                        path.join(__dirname, "webpack.config.js")],
                tasks: ["shell:osumo-webpack"],
                options: { spawn: false }
            }
        },

        init: {
            "shell:osumo-webpack": { dependencies: [] }
        },

        default: {
            "shell:osumo-webpack": { dependencies: [] }
        }
    });
};

