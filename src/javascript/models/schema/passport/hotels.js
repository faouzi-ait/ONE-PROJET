const hotels = {
  'active': '',
  'name': '',
  'rooms': '',
  'occupied-rooms': '',
  'remaining-rooms': '',
  'location': {
    'type': 'passport-locations',
    'jsonApi': 'hasOne'
  },
  'market': {
    'type': 'passport-markets',
    'jsonApi': 'hasOne'
  }
}

export default hotels