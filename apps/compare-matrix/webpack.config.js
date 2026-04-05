const webpack = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = (config) => {
  config.output.publicPath = "auto";
  config.optimization = config.optimization || {};
  config.devServer = {
    ...(config.devServer || {}),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: "all",
    port: 3003,
  };
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.API_URL": JSON.stringify(process.env.API_URL ?? ""),
    }),
    new ModuleFederationPlugin({
      name: "compareMatrix",
      filename: "remoteEntry.js",
      exposes: {
        "./CompareApp": path.resolve(__dirname, "src/bootstrap.ts"),
      },
      shared: {
        "@angular/core": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/common": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/common/http": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/router": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/platform-browser": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/platform-browser-dynamic": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/animations": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        "@angular/animations/browser": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^17.3.0",
          eager: true,
        },
        rxjs: {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^7.8.0",
          eager: true,
        },
        "rxjs/operators": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^7.8.0",
          eager: true,
        },
        "zone.js": {
          singleton: true,
          strictVersion: false,
          requiredVersion: "^0.14.3",
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
      },
    })
  );
  return config;
};
