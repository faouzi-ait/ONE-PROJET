const restrictedSeriesCompanies = {
  'expires-after': '',
  'restricted-series': {
    jsonApi: 'hasOne',
    type: 'series',
  },
  'restricted-company': {
    jsonApi: 'hasOne',
    type: 'companies',
  },
}

export default restrictedSeriesCompanies
