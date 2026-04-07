const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3004,
    host: "127.0.0.1",
    historyApiFallback: true,
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    client: {
      overlay: false,
    },
  },
  output: {
    publicPath: "auto",
    crossOriginLoading: "anonymous",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env", { modules: false }],
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
          parserOpts: { sourceType: "module" },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL ?? ""),
    }),
    new ModuleFederationPlugin({
      name: "auth",
      filename: "remoteEntry.js",
      exposes: {
        "./AuthApp": "./src/App.jsx",
      },
      shared: {
        react: {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^19.2.4",
          eager: true,
        },
        "react-dom": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^19.2.4",
          eager: true,
        },
        "react/jsx-runtime": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^19.2.4",
          eager: true,
        },
        "react/jsx-dev-runtime": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^19.2.4",
          eager: true,
        },
        scheduler: {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^0.27.0",
          eager: true,
        },
        "react-router-dom": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^6.30.3",
          eager: true,
        },
        "styled-components": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^6.1.13",
          eager: true,
        },
        zustand: {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^5.0.3",
          eager: true,
        },
        "@voltix/api-client": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
          eager: true,
        },
        "@voltix/shared-state": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
          eager: true,
        },
        "@voltix/shared-state/hooks": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
          eager: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public/index.html"),
      filename: "index.html",
      inject: "body",
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
