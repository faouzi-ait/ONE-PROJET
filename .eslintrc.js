module.exports = {
  extends: ['plugin:cypress/recommended', 'react-app'],
  plugins: ['cypress'],
  globals: {
    __CLIENT__: true,
    'cypress/globals': true,
  },
  rules: {
    'no-unused-vars': 2,
    'array-callback-return': 0,
    'react/jsx-no-comment-textnodes': 0,
    'new-parens': 0,
    'no-restricted-globals': 1
  },
}
