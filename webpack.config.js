var path = require('path')

module.exports = (_, args) => {
  const configDirs = {
    DIST_DIR: path.resolve(__dirname, './dist'),
    SRC_DIR: path.resolve(__dirname, './src'),
    BASE_DIR: __dirname
  }
  console.log(`Building using Webpack --config = ${args.mode}.config.js`)
  return require(`./webpack/${args.mode}.config.js`)(_, args, configDirs)
}
