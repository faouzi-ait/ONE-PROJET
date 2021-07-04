const babel = require('@babel/core')
const {
  createSourceWithoutTags,
} = require('../web_loaders/client-capture/module')

module.exports = {
  process(src, filename) {
    if (!process.env.CLIENT) {
      throw new Error('No client passed')
    }
    const { source: sourceWithoutTags, error } = createSourceWithoutTags(src, process.env.CLIENT)
    if (error) {
      throw new Error(error)
    }
    const transformedSrc = babel.transformSync(sourceWithoutTags, {
      presets: [
        'jest',
        '@babel/preset-react',
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
      plugins: [
        'react-html-attrs',
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-react-jsx-source',
        '@babel/plugin-proposal-optional-chaining',
      ],
      filename,
    }).code
    return transformedSrc
  },
}
