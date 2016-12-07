'use strict';

var path = require('path');

var webpack = require('webpack');

var srcDir         = path.resolve(__dirname, 'web-external', 'src');
var libDir         = path.resolve(__dirname, 'web-external', 'lib');
var nodeModulesDir = path.resolve(__dirname, 'node_modules');

var production = process.env.NODE_ENV === 'production';
var plugins = [];

if(production) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      output: {
        comments: false,
        semicolons: true
      }
    })
  );
}

plugins = plugins.concat([
  new webpack.HashedModuleIdsPlugin({
    hashFunction: 'sha1',
    hashDigestLength: 3
  }),

  new webpack.NamedModulesPlugin(),

  new webpack.ProvidePlugin({
    // Automtically detect jQuery and $ as free var in modules
    // and inject the jquery library
    // This is required by many jquery plugins
    jQuery: 'jquery',
    $: 'jquery',
    d3: 'd3'
  }),

  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    minChunks: 3
  }),

  new webpack.optimize.CommonsChunkPlugin({
    name: 'runtime',
    chunks: ['common'],
    minChunks: Infinity
  }),

  new webpack.LoaderOptionsPlugin({
    options: {
      semistandard: {
        global: ['location'],
        env: ['browser']
      }
    }
  })
]);

if(production) {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  );
}

module.exports = {
  cache: true,

  devtool: (production ? null : 'source-map'),

  entry: {
    common: [
      'backbone',
      'bluebird',
      'jquery',
      'lodash',
      'react',
      'react-dom',
      'react-redux',
      'redux'
    ],

    main: './main'
  },

  context: srcDir,

  output: {
    path: libDir,
    filename: '[name].js'
  },

  module: {
    loaders: [
      { test: /\.css$/,
        loader: 'style-loader!css-loader' },

      { test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader' },

      { test: /\.jade$/,
        loader: 'pug' },

      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader' },

      { test: /\.png$/,
        loader: "url-loader?limit=100000" },

      { test: /\.jpg$/,
        loader: "file-loader" },

      { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff' },

      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream' },

      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file' },

      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml' },

      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0', 'react']
        }
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx', '.styl', '.css', '.ttf', '.jade'],
    modules: ['node_modules']
  },

  plugins: plugins
};
