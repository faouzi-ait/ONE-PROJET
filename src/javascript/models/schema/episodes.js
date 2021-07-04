const episodes = {
  'name': '',
  'description': '',
  'position': '',
  'videos-count': '',
  'external-id': '',
  'series-id': '',
  'series': {
    'jsonApi': 'hasOne',
    'type': 'series'
  },
  'videos': {
    'jsonApi': 'hasMany',
    'type': 'videos'
  }
}

export default episodes