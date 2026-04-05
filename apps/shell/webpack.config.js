const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  output: {
    publicPath: "auto",
    crossOriginLoading: "anonymous",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
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
      name: "shell",
      remotes: {
        catalog: "catalog@http://localhost:3001/remoteEntry.js",
        checkout: "checkout@http://localhost:3002/remoteEntry.js",
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
        vue: {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^3.5.13",
          eager: false,
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
        "@voltix/api-client": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
          eager: true,
        },
        "@voltix/ui-kit": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
          eager: true,
        },
        "@voltix/utils": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
          eager: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
