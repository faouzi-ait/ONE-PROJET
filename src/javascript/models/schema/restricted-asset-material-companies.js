const restrictedAssetMaterialCompanies = {
  'expires-after': '',
  'restricted-asset-material': {
    jsonApi: 'hasOne',
    type: 'asset-materials',
  },
  'restricted-company': {
    jsonApi: 'hasOne',
    type: 'companies',
  },
}

export default restrictedAssetMaterialCompanies
