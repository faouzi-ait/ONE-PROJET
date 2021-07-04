const restrictedSeriesUsers = {
  'expires-after': '',
  'restricted-series': {
    jsonApi: 'hasOne',
    type: 'series',
  },
  'restricted-user': {
    jsonApi: 'hasOne',
    type: 'users',
  },
}

export default restrictedSeriesUsers
