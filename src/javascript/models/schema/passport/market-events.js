const marketEvents = {
  'active': '',
  'description': '',
  'end-date': '',
  'name': '',
  'start-date': '',
  'location': {
    'type': 'passport-locations',
    'jsonApi': 'hasOne'
  },
  'market': {
    'type': 'passport-markets',
    'jsonApi': 'hasOne'
  }
}

export default marketEvents