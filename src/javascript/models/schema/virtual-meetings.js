const virtualMeetings = {
  'background-image': '',
  'chat-enabled': '', // read-only copy from meetingsResource
  'conference': '',
  'end-time': '', // read-only copy from meetingsResource
  'finished-at': '',
  'host': '',
  'labels': '',
  'live': '',
  'room-key': '',
  'start-time': '', // read-only copy from meetingsResource
  'started-at': '',
  'time-elapsed': '',
  'title': '', // read-only copy from meetingsResource
  'token': '',
  'viewport': '',
  'meeting': {
    'jsonApi': 'hasOne',
    'type': 'meetings'
  },
  'attendees': {
    'jsonApi': 'hasMany',
    'type': 'attendees'
  }
}

export default virtualMeetings

