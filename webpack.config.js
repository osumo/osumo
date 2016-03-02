
var path = require("path");

var webpack = require("webpack");

module.exports = {
    cache: true,

    entry: {
        main: "./main"
    },

    context: path.resolve(__dirname, "web-external", "src"),

    output: {
        path: path.resolve(__dirname, "web-external", "lib"),
        filename: "[name].js"
    },


    module: {
        loaders: [
            { test: /\.css$/,
              loader: "style-loader!css-loader" },

            { test: /\.styl$/,
              loader: "style-loader!css-loader!stylus-loader" },

            { test: /\.jade$/,
              loader: "jade" },

            // required for babel
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                query: { presets: ["react", "es2015"] }
            }
        ]
    },

    resolve: {
        extensions: [".js", ".styl", ".css", ".jade", ""],
        modulesDirectories: ["./web-external/src", "./node_modules"]
    },

    plugins: [
        new webpack.ProvidePlugin({
            // Automtically detect jQuery and $ as free var in modules
            // and inject the jquery library
            // This is required by many jquery plugins
            jQuery: "jquery",
            $: "jquery"
        }),

        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        })
    ]
};

