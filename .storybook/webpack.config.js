// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const makeWebpackConfig = require('../webpack.config')

module.exports = ({ config }) => {
  const client = process.env.CLIENT
  const {
    plugins,
    resolve,
    module: { rules },
  } = makeWebpackConfig(null, {
    CLIENT: client.replace('--CLIENT=', ''),
    TARGET_ENV: 'staging',
    mode: 'development',
  })
  return {
    ...config,
    plugins: [...plugins, ...config.plugins],
    resolve,
    module: {
      rules: [
        ...config.module.rules.filter(({ loader }) => {
          if (!loader) return true
          return !loader.includes('file-loader')
        }),
        ...rules,
      ],
    },
  }
}
