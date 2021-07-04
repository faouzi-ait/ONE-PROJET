const meetingNotes = {
  'text': '',
  'pre-meeting-note': '',
  'created-at': '',
  'updated-at': '',
  'meeting': {
    'type': 'meetings',
    'jsonApi': 'hasOne'
  },
  'customer': {
    'type': 'user',
    'jsonApi': 'hasOne'
  }
}

export default meetingNotes
