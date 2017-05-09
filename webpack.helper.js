'use strict';

var process = require('process');
var webpack = require('webpack');

module.exports = function (cfg, pluginBuildData) {
  cfg.watchOptions = {
    poll: 1000
  };

  if (process.env.NODE_ENV === 'production') {
    cfg.devtool = 'cheap-module-source-map';
    cfg.plugins = cfg.plugins || [];
    cfg.plugins.push(new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }));
    cfg.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }));
  }

  cfg.module.loaders.push({
    test: /\.jsx?$/,
    exclude: /(node_modules|bower_components)/,
    include: [/plugins\/osumo/],
    loader: 'babel-loader',
    query: {
      plugins: ['transform-runtime'],
      presets: ['es2015', 'stage-0', 'react']
    }
  });

  cfg.resolve.extensions.push('.jsx');

  return cfg;
};

