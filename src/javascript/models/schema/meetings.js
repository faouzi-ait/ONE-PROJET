const meetings = {
  'client-details': '',
  'title': '',
  'timezone': '',
  'start-time': '',
  'end-time': '',
  'description': '',
  'location': '',
  'source-list-id': '',
  'meeting-details': '',
  'screener-message': '',
  'state': '',
  'critical': '',
  'has-meeting-notes': '',
  'is-meal-slot': '',
  'is-event-meeting': '',
  'meeting-attendees-count': '',
  'checked-in': '',
  'screener-email-address': '',
  'calendar-event-location-id' :'',
  'list-name': '',
  'remove-virtual-bg-image': '',
  'virtual': '',
  'virtual-bg-image': '',
  'chat-enabled': '',
  'conference': '',
  'owner-full-name': '',
  'customer': {
    'jsonApi': 'hasOne',
    'type': 'customers'
  },
  'owner': {
    'type': 'users',
    'jsonApi': 'hasOne'
  },
  'client': {
    'type': 'users',
    'jsonApi': 'hasOne'
  },
  'list': {
    'type': 'lists',
    'jsonApi': 'hasOne'
  },
  'source-list': {
    'type': 'lists',
    'jsonApi': 'hasOne'
  },
  'meeting-notes': {
    'jsonApi': 'hasMany',
    'type': 'meeting-note'
  },
  'meeting-attendees': {
    'jsonApi': 'hasMany',
    'type': 'meeting-attendees'
  },
  'calendar-event': {
    'jsonApi': 'hasOne',
    'type': 'calendar-events'
  },
  'calendar-event-location': {
    'jsonApi': 'hasOne',
    'type': 'calendar-event-locations'
  },
  'calendar-event-meal-slot': {
    'jsonApi': 'hasOne',
    'type': 'calendar-event-meal-slots'
  },
  'meeting-followups': {
    jsonApi: 'hasMany',
    type: 'meeting-followups'
  },
  'virtual-meeting': {
    'jsonApi': 'hasOne',
    'type': 'virtual-meetings'
  }
}

export default meetings
