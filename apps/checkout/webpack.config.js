const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3002,
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
  resolve: {
    extensions: [".js", ".vue"],
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "../../node_modules"),
    ],
    alias: {
      vue$: path.resolve(__dirname, "node_modules/vue/dist/vue.esm.js"),
      vue: path.resolve(__dirname, "node_modules/vue/dist/vue.esm.js"),
    },
  },
  module: {
    rules: [
      { test: /\.vue$/, loader: "vue-loader" },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: [["@babel/preset-env", { modules: false }]],
        },
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL ?? ""),
    }),
    new ModuleFederationPlugin({
      name: "checkout",
      filename: "remoteEntry.js",
      exposes: {
        "./CheckoutApp": "./src/bootstrap.js",
      },
      shared: {
        vue: {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^2.7.16",
          eager: true,
        },
        "@voltix/shared-state": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "0.0.0",
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
        "@voltix/utils": {
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
};
