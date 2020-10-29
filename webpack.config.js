const currentTask = process.env.npm_lifecycle_event;
const path = require('path');

// Clean old files
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

// Extract the css from the bundle
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Fixes the hash names to html files
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Applies htmlwebpackplugin to all html files
const fse = require('fs-extra');
 
const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('autoprefixer'),
];

// Personal plugin to copy images from app to dist
class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy images', function() {
      fse.copySync('./app/assets/images', './docs/assets/images')
    })
  }
}

let cssConfig = {
  test: /\.css$/i,
  use: [
    'css-loader?url=false',
    // activate postcss and its plugins
    { loader: 'postcss-loader', options: { plugins: postCSSPlugins } },
  ],
}

// Filter .html files and apply the htmlwebpackplugin
let pages = fse.readdirSync('./app').filter(function(file) {
  return file.endsWith('.html')
}).map(function(page) {
  return new HtmlWebpackPlugin({
    filename: page,
    template: `./app/${page}`
  })
})

let config = {
  entry: './app/assets/scripts/App.js',
  plugins: pages,
  module: {
    rules: [
      cssConfig,
    ],
  }
}

if (currentTask == 'dev') {
  cssConfig.use.unshift('style-loader');
  config.output = {
    filename: 'bundled.js', // bundled file
    path: path.resolve(__dirname, 'app'),
  }

  config.devServer = {
    // automate html reload
    before: function (app, server) {
      server._watch('./app/**/*.html');
    },
    // automate css updates
    contentBase: path.join(__dirname, 'app'),
    hot: true,
    port: 3000,
    host: '0.0.0.0',
  }

  config.mode = 'development'
}

if (currentTask == 'build') {
  // use babel to make javascript backwards compatible
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }
  })
  cssConfig.use.unshift(MiniCssExtractPlugin.loader);
  postCSSPlugins.push(require('cssnano')); // compress css file
  config.output = {
    filename: '[name].[chunkhash].js', // bundled file
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'docs'),
  }
  config.mode = 'production'
  config.optimization = {
    splitChunks: {chunks: 'all'}
  }
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({filename: 'styles.[chunkhash].css'}),
    new RunAfterCompile()
    );
}

module.exports = config;