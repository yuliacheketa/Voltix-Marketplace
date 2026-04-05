const path = require("path");

/** @type {import('@storybook/react-webpack5').StorybookConfig} */
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-essentials",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fullySpecified = false;
    config.resolve.extensionAlias = {
      ".js": [".tsx", ".ts", ".js"],
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "@voltix/utils": path.resolve(__dirname, "../../utils/dist/index.js"),
    };
    return config;
  },
};
