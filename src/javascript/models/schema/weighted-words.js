const virtualMeetings = {
  'name': '',
  'weight': '',
  'programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes',
    'mirage': {
      'inverse': 'programmes'
    }
  },
}

export default virtualMeetings
