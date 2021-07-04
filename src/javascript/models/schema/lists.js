const lists = {
  'name': '',
  'programmes-count': '',
  'programmes-count-without-restricted': '',
  'videos-count': '',
  'videos-count-without-restricted': '',
  'series-count': '',
  'series-count-without-restricted': '',
  'global': '',
  'meeting-list': '',
  'updated-at': '',
  'images': '',
  'internal': '',
  'shared-by-id': '',
  'list-elements': '',
  'list-programmes': {
    'jsonApi': 'hasMany',
    'type': 'list-programme'
  },
  'list-videos': {
    'jsonApi': 'hasMany',
    'type': 'list-video'
  },
  'list-series': {
    'jsonApi': 'hasMany',
    'type': 'list-sery'
  },
  'user': {
    'jsonApi': 'hasOne',
    'type': 'users'
  },
  'meeting': {
    'jsonApi': 'hasOne',
    'type': 'meeting'
  },
  'customer': {
    'jsonApi': 'hasOne',
    'type': 'user'
  },
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programme'
  },
  'series': {
    'jsonApi': 'hasMany',
    'type': 'series'
  },
  'videos': {
    'jsonApi': 'hasMany',
    'type': 'videos'
  },
}

export default lists

