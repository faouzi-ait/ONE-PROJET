const hotelReservations = {
  'check-in-date': '',
  'check-out-date': '',
  'confirmed': '',
  'required': '',
  'room-type': '',
  'trip': {
    'jsonApi': 'hasOne',
    'type': 'passport-trips'
  },
  'hotel': {
    'jsonApi': 'hasOne',
    'type': 'passport-hotels'
  },
}

export default hotelReservations