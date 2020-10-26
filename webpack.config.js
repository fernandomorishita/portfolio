const path = require('path');
 
const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('autoprefixer'),
];
 
module.exports = {
  entry: './app/assets/scripts/App.js',
  output: {
    filename: 'bundled.js', // bundled file
    path: path.resolve(__dirname, 'app'),
  },
  devServer: {
    // automate html reload
    before: function (app, server) {
      server._watch('./app/**/*.html');
    },
    // automate css updates
    contentBase: path.join(__dirname, 'app'),
    hot: true,
    port: 3000,
    host: '0.0.0.0',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          // css-loader bundles the css, style-loader uses the css
          'style-loader',
          'css-loader?url=false',
          // activate postcss and its plugins
          { loader: 'postcss-loader', options: { plugins: postCSSPlugins } },
        ],
      },
    ],
  },
};
