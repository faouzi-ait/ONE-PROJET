const calendarEvents = {
  'title': '',
  'start-time': '',
  'end-time': '',
  'status': '',
  'timezone': '',
  'active': '',
  'closed': '',
  'invites-sent-at' : '',
  'calendar-event-locations': {
    'jsonApi': 'hasMany',
    'type': 'calendar-event-locations'
  },
  'calendar-event-meal-slots': {
    'jsonApi': 'hasMany',
    'type': 'calendar-event-meal-slots'
  },
  'calendar-event-opening-times': {
    'jsonApi': 'hasMany',
    'type': 'calendar-event-opening-times'
  },
  'calendar': {
    'jsonApi': 'hasOne',
    'type': 'calendars'
  },
  'contact': {
    'jsonApi': 'hasOne',
    'type': 'users'
  }
}

export default calendarEvents

