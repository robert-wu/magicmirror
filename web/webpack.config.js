/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {

  output: {
    path: __dirname + '/dist',
    filename: 'bundle.web.js',
    publicPath: '/'
  },

  cache: true,
  debug: true,
  devtool: 'source-map',
  entry: [
    './app/main.js'
  ],

  stats: {
    colors: true,
    reasons: true
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'styles': __dirname + '/app/styles',
      'components': __dirname + '/app/components/',
      'img': __dirname + '/app/assets'
    }
  },
  module: {
    //preLoaders: [{
    //  test: /\.(js|jsx)$/,
    //  exclude: /node_modules/,
    //  loader: 'eslint-loader'
    //}],
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      include: path.join(__dirname, 'app'),
      loader: 'babel-loader',
      query: {
        plugins: ['transform-runtime', 'add-module-exports', 'transform-decorators-legacy'],
        presets: ['react', 'es2015', 'stage-1', 'stage-0']
      }
    }, {
      test: /\.scss/,
      loader: 'style-loader!css-loader?modules&localIdentName=[path][name]---[local]---[hash:base64:5]!sass-loader?outputStyle=expanded'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|woff|woff2|gif)$/,
      loader: 'url-loader?limit=8192&prefix=/'
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]

};
