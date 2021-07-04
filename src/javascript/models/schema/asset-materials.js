const assetMaterials = {
  'name': '',
  'gallery': '',
  'restricted': '',
  'public-asset': '',
  'updatable': '',
  'programme-name': '',
  'programme-slug': '',
  'programme-id': '',
  'series-name': '',
  'parent': {
    'jsonApi': 'hasOne',
    // Cannot have a `type` (used to upload programme & series asset-material)
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
  'restricted-companies': {
    'type': 'companies',
    'jsonApi': 'hasMany'
  },
  'restricted-groups': {
    'type': 'groups',
    'jsonApi': 'hasMany'
  },
  'languages': {
    'type': 'languages',
    'jsonApi': 'hasMany'
  },
  'restricted-asset-material-users': {
    'jsonApi': 'hasMany',
    'type': 'restricted-asset-material-users'
  },
}

export default assetMaterials

