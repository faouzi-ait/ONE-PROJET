
const virtualMeetingAttendees = {
  'attendee-status': '',
  'attendee-type': '',
  'jitsi-jwt': '',
  'jwt': '',
  'label': '',
  'name': '',
  'virtual-meeting': {
    'jsonApi': 'hasOne',
    'type': 'virtual-meetings'
  },
  'attendees': {
    'jsonApi': 'hasMany',
    'type': 'virtual-meeting-attendees'
  }
}

export default virtualMeetingAttendees