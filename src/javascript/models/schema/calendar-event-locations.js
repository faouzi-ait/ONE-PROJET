const calendarEventLocations = {
  'meal': '',
  'name': '',
  'nickname': '',
  'max-attendees': '',
  'calendar-event': {
    'jsonApi': 'hasOne',
    'type': 'calendar-events'
  },
  'total-meals-bookable': '',
  'max-meals-available': '',
  'multi-meetings' : '',
  'meals-allocation-stats' : '',
  'calendar-event-location-restrictions': {
    'jsonApi': 'hasMany',
    'type': 'calendar-event-location-restrictions'
  }
}

 export default calendarEventLocations

