const markets = {
  'active': '',
  'end-date': '',
  'flight-schedule-pdf': '',
  'hotel-recharge-amount': '',
  'name' : '',
  'remove-flight-schedule-pdf': '',
  'start-date': '',
  'travel-end-date': '', // closing date
  'trip-recharge-amount': '',
  'total-recharge-amount': '',
  'locations': {
    'jsonApi': 'hasMany',
    'type': 'passport-location'
  },
  'contents': {
    'jsonApi': 'hasMany',
    'type': 'passport-content'
  }
}

export default markets