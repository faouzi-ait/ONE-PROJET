const calendarEventLocationRestrictions = {
  'start-date': '',
  'end-date': '',
  'start-time': '',
  'end-time': '',
  'calendar-event-location': {
    'jsonApi': 'hasOne',
    'type': 'calendar-event-locations'
  },
  'users': {
    'jsonApi': 'hasMany',
    'type': 'users'
  }
}

export default calendarEventLocationRestrictions

