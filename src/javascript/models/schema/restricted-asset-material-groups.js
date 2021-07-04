const restrictedAssetMaterialGroups = {
  'expires-after': '',
  'restricted-asset-material': {
    jsonApi: 'hasOne',
    type: 'asset-materials',
  },
  'restricted-group': {
    jsonApi: 'hasOne',
    type: 'groups',
  },
}

export default restrictedAssetMaterialGroups
