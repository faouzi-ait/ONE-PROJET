const programmeTypes = {
  'name': '',
  'programmes-count': '',
  'users-count': '',
  'programme' : {
    'jsonApi': 'hasMany',
    'type' : 'programmes'
  },
  'users' : {
    'jsonApi': 'hasMany',
    'type' : 'users'
  }
}

export default programmeTypes