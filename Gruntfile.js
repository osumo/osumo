
/* jshint node: true */

module.exports = function (grunt) {

    var path = require("path");
    var fs = require("fs");

    // This gruntfile is only designed to be used with girder's build system.
    // Fail if grunt is executed here.
    if (path.resolve(__dirname) === path.resolve(process.cwd())) {
        grunt.fail.fatal(
            "To build Osumo, run grunt from Girder's root directory");
    }

    pluginPath = path.resolve(grunt.config.get("pluginDir"), "osumo"),
    packageJson = path.resolve(pluginPath, "package.json"),

    grunt.config.merge({
        shell: {
            "osumo-npm": {
                /*
                 * TODO(opadron): remove the true part once webpack 2 finally
                 *                comes out of beta
                 */
                command: "npm install || true",
                options: {
                    execOptions: { cwd: pluginPath }
                },
                src: [packageJson]
            }
        },

        watch: {
            "plugin-osumo-npm": {
                files: [packageJson],
                tasks: ["shell:osumo-npm"]
            }
        },

        init: {
            "shell:osumo-npm": { dependencies: [] }
        }
    });

    var webpack = null;
    try { webpack = require("webpack"); } catch (e) { }

    if(webpack === null) {
        grunt.log.writeln("webpack unavailable.".yellow);
        grunt.log.writeln([
            "grunt configuration".yellow.underline,
            "will not be set this run.".yellow].join(" "));
        return;
    }

    grunt.config.merge({
        shell: {
            "osumo-webpack": {
                command: ["./node_modules/webpack/bin/webpack.js",
                          "--bail",
                          "--display-error-details"].join(" "),
                options: {
                    execOptions: { cwd: pluginPath }
                }
            }
        },

        watch: {
            "plugin-osumo-webpack": {
                files: [path.join(pluginPath, "web-external", "src", "**", "*"),
                        path.join(pluginPath, "Gruntfile.js"),
                        path.join(pluginPath, "webpack.config.js")],
                tasks: ["shell:osumo-webpack"],
                options: { spawn: false }
            }
        },

        default: {
            "shell:osumo-webpack": { dependencies: [] }
        }
    });
};

