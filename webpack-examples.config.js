"use strict";
const webpack = require("webpack");
const fs = require("fs");

// Builds example bundles
module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    commons: ["lodash"]
  },
  devtool: "cheap-module-eval-source-map",
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }
    }
  },
  output: {
    path: __dirname + "/examples",
    filename: "[name].js",
    sourceMapFilename: "[file].map"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          cacheDirectory: true
        }
      },
      {
        test: /\.css?$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        // sigil to load self into #content
        STATIC_EXAMPLES: JSON.stringify(true)
      }
    })
  ],
  devServer: {
    port: 4002,
    open: true,
    openPage: "examples/0-showcase.html",
    contentBase: ".",
    publicPath: "/examples/"
  },
  resolve: {
    extensions: [".js", ".jsx", "css"],
    alias: {
      "react-grid-layout-mdt": __dirname + "/index.js"
    }
  }
};

// Load all entry points
const files = fs
  .readdirSync(__dirname + "/test/examples")
  .filter(function(element, index, array) {
    return element.match(/^.+\.jsx$/);
  });

for (const file of files) {
  const module_name = file.replace(/\.jsx$/, "");
  module.exports.entry[module_name] = "./test/examples/" + file;
}
