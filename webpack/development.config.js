const path = require('path')
const webpackMerge = require('webpack-merge')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (_, argv, configDirs) => {
  const commonConfig = Object.assign({}, require('./common.config.js')(_, argv, configDirs))
  const { DIST_DIR, SRC_DIR } = configDirs
  let IEDevMode = argv.iedevmode === 'true'

  const plugins = [
    new MiniCssExtractPlugin({
      filename: '/assets/[name].production.css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(SRC_DIR,  './index.template.ejs'),
      filename: 'index.html',
      inject: false,
    }),
  ]

  // To run in development on ie please use `npm run start:ie <clientName>` - needs to babelify node_modules
  const devConfig = {
    devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?)$/,
          ...(!IEDevMode && { // To test in InternetExplorer we have to babelify node_modules (default: exclude them to speed up build time)
            exclude: /(node_modules|bower_components)/,
            include: SRC_DIR,
          }),
          use: ['happypack/loader?id=jsx'],
        },

      ],
    },
    output: {
      path: DIST_DIR,
      filename: 'assets/[name].production.js',
      publicPath: '/',
    },
    plugins,
    devServer: {
      hot: true,
      contentBase: 'app',
      https: false,
      host: '0.0.0.0',
      open: true,
      overlay: {
        errors: false,
        warnings: false,
      },
      stats: 'errors-only',
      historyApiFallback: {
        index: 'index.html',
        rewrites: [
          // { from: /\/admin/, to: '/admin.html' },
          { from: /\//, to: '/index.html' },
        ],
      },
      watchOptions: {
        ignored: /node_modules/
      }
    },
  }

  return webpackMerge(commonConfig, devConfig)
}