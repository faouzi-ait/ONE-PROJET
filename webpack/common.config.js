const autoprefixer = require('autoprefixer')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const liteClients = require('../src/javascript/utils/lite-clients')

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HappyPack = require('happypack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = (_, argv, configDirs) => {
  console.log(`ENVIRONMENT: ${argv.mode}`)
  console.log(`TARGET ENVIRONMENT: ${argv.TARGET_ENV}`)
  const { SRC_DIR, BASE_DIR } = configDirs
  const devMode = argv.mode === 'development'

  const createEnvVariables = () => {
    // hard coded variables
    const envVariables = {
      API_KEY: JSON.stringify(process.env.npm_config_api_key),
      API_URL: JSON.stringify(process.env.npm_config_api_url),
      TARGET_ENV: JSON.stringify(argv.TARGET_ENV),
      CLIENT: JSON.stringify(argv.CLIENT),
      LITE_CLIENT: JSON.stringify(argv.LITE_CLIENT),
      GOOGLE_MAPS_API: JSON.stringify(process.env.GOOGLE_MAPS_API)
    }
    // copy in all lite client variables
    liteClients.forEach((liteClient) => {
      const liteClientUC = liteClient.toUpperCase()
      envVariables[`${liteClientUC}_API_KEY`] = JSON.stringify(process.env[`${liteClientUC}_API_KEY`])
    })
    return envVariables
  }

  const plugins = [
    new HappyPack({
      id: 'jsx',
      threads: 4,
      loaders: [
        {
          loader: 'cache-loader',
          options: {
            cacheDirectory: path.resolve(BASE_DIR, '.cache'),
          },
        },
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              '@babel/preset-typescript',
              '@babel/preset-react',
              '@babel/preset-env',
            ],
            plugins: [
              'react-html-attrs',
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-react-jsx-source',
              '@babel/plugin-proposal-optional-chaining',
            ],
          },
        },
        {
          loader: path.resolve(BASE_DIR, './web_loaders/client-capture'),
          options: {
            client: argv.CLIENT,
          },
        },
      ],
    }),
    new webpack.DefinePlugin({'process.env': createEnvVariables()}),
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
    new webpack.NormalModuleReplacementPlugin(
      /images\//,
      (resource) => {
        if (resource.request.includes('/file-loader/') ||
            resource.request.includes('/../') ||
            resource.request.includes('require.stub')) {
          return /* not coming from js require */
        }
        const pathToCheck = path.join('./src/', resource.request)
        if (!fs.existsSync(pathToCheck)) {
          resource.request = 'images/require.stub'
        }
      }
    ),
  ]

  if (argv.rtvanalysis) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  return {
    context: SRC_DIR,
    entry: {
      application: ['@babel/polyfill', './javascript/application.jsx'],
      // admin: ['@babel/polyfill', './javascript/admin.jsx'],
    },
    resolveLoader: {
      modules: ['node_modules', path.resolve(BASE_DIR, 'web_loaders')],
    },
    module: {
      rules: [
        {
          test: /\.sass$/,
          include: SRC_DIR,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheDirectory: path.resolve(BASE_DIR, '.cache'),
              },
            },
            { loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader },
            { loader: 'css-loader', options: { sourceMap: devMode } },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: devMode,
                plugins: [
                  autoprefixer({
                    browsers: ['last 2 versions'],
                  }),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [SRC_DIR],
                indentedSyntax: true,
                sourceMap: devMode,
              },
            },
            {
              loader: 'import-glob-loader',
            },
          ],
        },
        {
          test: /\.html$/,
          include: SRC_DIR,
          exclude: /(node_modules|bower_components)/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
        {
          test: /\.css$/,
          include: SRC_DIR,
          loader: 'css-loader?minimize!',
        },
        {
          test: /\.(jpe?g|png|gif|svg|)$/i,
          include: SRC_DIR,
          loader: 'file-loader',
          options: {
            name: 'assets/images/[name].[ext]',
          },
        },
        {
          test: /\.(ttc|ttf|otf|woff|woff2)$/i,
          include: SRC_DIR,
          loader: 'file-loader',
          options: {
            name: 'assets/fonts/[name].[ext]',
          },
        },
        {
          // ITV only
          test: /brightcovePlayer\/default\/index\.min\.(js)$/i,
          include: SRC_DIR,
          loader: 'file-loader',
          options: {
            name: 'assets/brightcovePlayer/default/index.min.js',
          },
        },
      ],
    },
    plugins,
    resolve: {
      extensions: [
        '.ts',
        '.tsx',
        '.html',
        '.js',
        '.jsx',
        '.sass',
        '.jpg',
        '.png',
        '.gif',
        '.svg',
        '.css',
        '.json',
      ],
      modules: [
        path.resolve(SRC_DIR, './_customisations'),
        SRC_DIR,
        'node_modules',
      ],
      alias: {
        humanize: path.join(SRC_DIR, './javascript/humanize.js'),
      },
    },
  }
}
