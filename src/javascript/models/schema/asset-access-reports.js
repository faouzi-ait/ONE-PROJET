const assetAccessReports = {
  'name': '',
  'gallery': '',
  'restricted': '',
  'programme-name' : '',
  'series-name' : '',
  'parent': {
    'jsonApi': 'hasOne'
  },
  'asset-category': {
    'type': 'asset-categories',
    'jsonApi': 'hasOne'
  },
  'asset-items': {
    'type': 'asset-items',
    'jsonApi': 'hasMany'
  },
  'restricted-users': {
    'type': 'users',
    'jsonApi': 'hasMany'
  },
  'restricted-users-with-company-users': {
    'type': 'users',
    'jsonApi': 'hasMany'
  },
  'languages': {
    'type': 'languages',
    'jsonApi': 'hasMany'
  },
  'restricted-companies': {
    'type': 'companies',
    'jsonApi': 'hasMany'
  },
}

export default assetAccessReports