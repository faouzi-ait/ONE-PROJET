import requireContext from 'require-context';
import path from 'path'
import fs from 'fs'

const dash2Camel = (name) => name.replace( /-+(.)/gi, (match, capture1) => capture1.toUpperCase())

const modelData = (function requireAll(r) {
  return r.keys().reduce((acc, curr) => {
    const modelKey = dash2Camel(curr.replace('./', '').replace('.js', ''))
    if (modelKey.indexOf('/') === -1) {
      acc[modelKey] = r(curr).default
    } else { // nested modelData - This can only deal with up to two levels of folder depth (e.g. namespaced - reports.byDashboard.topGenres)
      const nameSpacing = modelKey.split('/')
      if(!acc[nameSpacing[0]]) acc[nameSpacing[0]] = {}
      if(nameSpacing.length == 2) {
        acc[nameSpacing[0]][nameSpacing[1]] = r(curr).default
      } else {
        if(!acc[nameSpacing[0]][nameSpacing[1]]) acc[nameSpacing[0]][nameSpacing[1]] = {}
        acc[nameSpacing[0]][nameSpacing[1]][nameSpacing[2]] = r(curr).default
      }
    }
    return acc
  }, {})
})(requireContext(path.resolve(__dirname, './schema'), true, /\.(js)$/))

if (modelData) {
  fs.writeFileSync(path.resolve(__dirname, './models.json'), JSON.stringify(modelData))
}