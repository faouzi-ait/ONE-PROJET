const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (_, argv, configDirs) => {
  const commonConfig = Object.assign({}, require('./common.config.js')(_, argv, configDirs))

  const { DIST_DIR, SRC_DIR } = configDirs

  const plugins = [
    new MiniCssExtractPlugin({
      filename: './assets/[name].production.[contentHash].css',
      // filename: 'assets/[name].production.css',
      ignoreOrder: true,
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(SRC_DIR,  './index.template.ejs'),
      filename: 'index.html',
      inject: false,
    }),
    new CopyWebpackPlugin([
      {
        from: 'redirects/*',
        to: DIST_DIR,
        flatten: true,
      },
    ]),
    new CopyWebpackPlugin([{ from: 'sw.js', to: 'sw.js' }]),
    new CopyWebpackPlugin([{ from: 'robots.txt', to: 'robots.txt' }]),
    new webpack.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
  ]

  if (argv.CLIENT === 'itv') {
    plugins.push(
      new CopyWebpackPlugin([{ from: '.well-known', to: '.well-known' }]),
    )
  }

  const prodConfig = {
    devtool: false,
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?)$/,
          use: ['happypack/loader?id=jsx'],
        },
      ]
    },
    optimization: {
      minimize: true,
      splitChunks: {
        minSize: 30000,
        maxAsyncRequests: 15,
        maxInitialRequests: 10,
        cacheGroups: {
          vendors: false,
          default: {
            chunks: 'async',
            name: 'common',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
            enforce: true
          },
          asyncVendors: {
            chunks: 'async',
            name(module) {
              // get the packageName -> node_modules/packageName/not/this/part.js
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm-async.${packageName.replace('@', '')}`;
            },
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 2,
            reuseExistingChunk: true,
            enforce: true
          },
          initialVendors: {
            chunks: 'initial',
            name: 'npm-shared',
            test: /[\\/]node_modules[\\/]/,
            priority: 40,
            minChunks: 2,
            reuseExistingChunk: true,
            enforce: true
          },
        }
      }
    },
    output: {
      path: DIST_DIR,
      filename: './assets/[name].production.[chunkHash].js',
      // filename: 'assets/[name].production.js',
      publicPath: '/',
    },
    plugins,
  }

  return webpackMerge(commonConfig, prodConfig)
}