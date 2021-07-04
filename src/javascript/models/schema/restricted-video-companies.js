const restrictedVideoCompanies = {
  'expires-after': '',
  'restricted-video': {
    jsonApi: 'hasOne',
    type: 'videos',
  },
  'restricted-company': {
    jsonApi: 'hasOne',
    type: 'companies',
  },
}

export default restrictedVideoCompanies
