const path = require('path');
const rootDir = path.resolve(__dirname, '..');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const srcDir = path.resolve(rootDir, 'src');
const distDir = path.resolve(rootDir, 'dist');

const extractSASS = new ExtractTextPlugin('bundle.css');

module.exports = {
  entry: {
    mainJS: path.join(srcDir, 'main.js')
  },

  output: {
    filename: 'bundle.js',
    path: distDir
  },

  node: {
    fs: "empty",
    child_process: "empty"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
            loader: extractSASS.extract({
                loader: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // use style-loader in development
                fallback: "style-loader"
            })
      }
    ]
  },

  plugins: [
    extractSASS
  ]
};

