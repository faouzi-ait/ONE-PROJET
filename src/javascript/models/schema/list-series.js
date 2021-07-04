const listSeries = {
  'list-position': '',
  'notes-count' : '',
  'screener': '',
  'series-id': '',
  'programme-name': '',
  'programme-slug': '',
  'series': {
    'jsonApi': 'hasOne',
    'type': 'series'
  },
  'list-series-notes': {
    'jsonApi': 'hasMany',
    'type': 'series-notes'
  },
  'list': {
    'jsonApi': 'hasOne',
    'type': 'lists'
  },
  'like': {
    'jsonApi': 'hasOne',
    'type': 'likes'
  }
}

export default listSeries

