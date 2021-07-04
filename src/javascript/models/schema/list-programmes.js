const listProgrammes = {
  'list-position': '',
  'notes-count': '',
  'screener': '',
  'programme-id': '',
  'programme-slug': '',
  'like': {
    'jsonApi': 'hasOne',
    'type': 'likes'
  },
  'programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  },
  'list': {
    'jsonApi': 'hasOne',
    'type': 'lists'
  },
  'list-programme-notes': {
    'jsonApi': 'hasMany',
    'type': 'list-programme-note'
  },
  'customer': {
    'jsonApi': 'hasOne',
    'type': 'user'
  }
}

export default listProgrammes

