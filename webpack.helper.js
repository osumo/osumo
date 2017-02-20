'use strict';

module.exports = function (cfg, pluginBuildData) {

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
