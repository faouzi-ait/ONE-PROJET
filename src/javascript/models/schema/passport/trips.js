const trips = {
  'avatar': '',
  'complete': '',
  'email': '',
  'first-name': '',
  'job-title': '',
  'last-name': '',
  'remove-avatar': '',
  'telephone-number': '',
  'title': '',
  'notes': '',
  'flights': {
    'jsonApi': 'hasMany',
    'type': 'passport-flights'
  },
  'hotel-reservations': {
    'jsonApi': 'hasMany',
    'type': 'passport-hotel-reservations'
  },
  'market': {
    'type': 'passport-markets',
    'jsonApi': 'hasOne'
  },
  'market-event-users': {
    'type': 'passport-market-event-users',
    'jsonApi': 'hasMany'
  },
  'recharges': {
    'jsonApi': 'hasOne',
    'type': 'passport-recharges'
  },
  'support-user': {
    'jsonApi': 'hasOne',
    'type': 'users'
  },
  'trip-type': {
    'jsonApi': 'hasOne',
    'type': 'passport-trip-types'
  },
  'trip-invoice-type': {
    'jsonApi': 'hasOne',
    'type': 'passport-trip-invoice-types'
  },
  'transfers': {
    'jsonApi': 'hasMany',
    'type': 'passport-transfers'
  },
  'user': {
    'jsonApi': 'hasOne',
    'type': 'users'
  }

}

export default trips