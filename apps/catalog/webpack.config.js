const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    port: 3001,
    historyApiFallback: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            parserOpts: { sourceType: 'module' },
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL ?? ''),
    }),
    new ModuleFederationPlugin({
      name: 'catalog', 
      filename: 'remoteEntry.js', 
      exposes: {
        './CatalogApp': './src/App', 
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.2.4', eager: true },
        'react-dom': { singleton: true, requiredVersion: '^19.2.4', eager: true },
        'styled-components': {
          singleton: true,
          requiredVersion: '^6.1.13',
          eager: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};