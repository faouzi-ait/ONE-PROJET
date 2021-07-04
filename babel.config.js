/**
 * This babel config will only be picked up by Jest
 */
module.exports = {
  presets: [
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
}
