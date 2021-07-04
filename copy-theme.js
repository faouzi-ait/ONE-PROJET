const fs = require('file-system')
const createImageDimensionsFromYaml = require('./scripts/createImageDimensions')

const theme = process.argv[2]

function removeConfigFiles(paths) {
  paths.forEach((rootPath) => {
    function deleteFolderRecursive(path) {
      if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
          fs.readdirSync(path).forEach(function(file, index) {
            const curPath = path + "/" + file
            if (fs.lstatSync(curPath).isDirectory()) {
              deleteFolderRecursive(curPath)
            } else {
              fs.unlinkSync(curPath)
            }
          })
          if (path !== rootPath) { // only remove sub-folders
            fs.rmdirSync(path)
          }
        } else { // path is a file - just delete it
          fs.unlinkSync(path)
        }
      }
    }
    deleteFolderRecursive(rootPath)
  })
}

removeConfigFiles([
  './src/stylesheets/_theme',
  './src/images/theme',
  './src/fonts',
  './src/robots.txt',
  './src/javascript/config/custom-features.js',
  './src/javascript/config/custom-features.ts',
  './src/javascript/config/custom-icons.js',
  './src/javascript/config/image-dimensions.js',
])

fs.copyFileSync(`./src/theme/${theme}/_redirects`, 'src/redirects/_redirects')
fs.copyFileSync(`./src/theme/${theme}/robots.txt`, 'src/robots.txt')
fs.copySync(`./src/stylesheets/default`, 'src/stylesheets/_theme')
fs.copySync(`./src/theme/${theme}/stylesheets`, 'src/stylesheets/_theme')
fs.copySync(`./src/theme/${theme}/images`, 'src/images/theme')
fs.copySync(`./src/theme/${theme}/fonts`, 'src/fonts')
fs.copySync(`./src/theme/${theme}/config`, 'src/javascript/config')

createImageDimensionsFromYaml(theme)
