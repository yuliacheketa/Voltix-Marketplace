const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3002,
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
      vue: path.resolve(
        __dirname,
        "../../node_modules/vue/dist/vue.esm-bundler.js"
      ),
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
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
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
          requiredVersion: "^3.5.13",
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
