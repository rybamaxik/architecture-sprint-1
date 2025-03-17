const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');
const Dotenv = require('dotenv-webpack');

const deps = require("./package.json").dependencies;

const printCompilationMessage = require('./compilation.config.js');

module.exports = (_, argv) => ({
  output: {
    publicPath: "http://localhost:8095/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    alias: {
      'shared-lib-usercontext': path.resolve(__dirname, '../shared/usercontext'),
    }
  },

  devServer: {
    port: 8095,
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src')],
    onListening: function (devServer) {
      const port = devServer.server.address().port

      printCompilationMessage('compiling', port)

      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
        setImmediate(() => {
          if (stats.hasErrors()) {
            printCompilationMessage('failure', port)
          } else {
            printCompilationMessage('success', port)
          }
        })
      })
    }
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'url-loader?limit=100000'
        }
      }
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      filename: "remoteEntry.js",
      remotes: {
        'auth': 'auth@http://localhost:8097/remoteEntry.js',
        'cardboard': 'cardboard@http://localhost:8096/remoteEntry.js'
      },
      exposes: {},
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
        'shared-lib-usercontext': {
          import: 'shared-lib-usercontext',
          requiredVersion: require('../shared/usercontext/package.json').version,
        }
      },
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
    new Dotenv()
  ],
});
