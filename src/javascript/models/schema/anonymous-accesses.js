const anonymousAccess = {
  'emails': '',
  'expires-after': '',
  'message': '',
  'name': '',
  'view-count-sum': '',
  'view-count-limit': '',
  'anonymous-access-items': {
    'jsonApi': 'hasMany',
    'type': 'anonymous-access-items'
  },
  'list': {
    'jsonApi': 'hasOne',
    'type': 'lists'
  },
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
  },
  'series': {
    'jsonApi': 'hasMany',
    'type': 'series'
  },
  'videos': {
    'jsonApi': 'hasMany',
    'type': 'videos'
  }
}

export default anonymousAccess