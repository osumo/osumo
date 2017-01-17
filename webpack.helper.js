'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = function(cfg, pluginBuildData) {
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

  /*
   * TODO look into moving this to core
   */
  cfg.resolve.extensions.push('.jsx')

  return cfg;
};

