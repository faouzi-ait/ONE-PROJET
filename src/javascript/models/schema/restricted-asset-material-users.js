const restrictedAssetMaterialCompanies = {
  'expires-after': '',
  'restricted-asset-material': {
    jsonApi: 'hasOne',
    type: 'asset-materials',
  },
  'restricted-user': {
    jsonApi: 'hasOne',
    type: 'users',
  },
}

export default restrictedAssetMaterialCompanies
