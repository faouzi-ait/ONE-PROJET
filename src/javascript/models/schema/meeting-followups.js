const meetingFollowups = {
  email: '',
  message: '',
  'sent-at': '',
  'send-to-owner': '',
  'authorize-email': '',
  'authorize-attendees': '',
  'send-to-attendees': '',
  meeting: {
    jsonApi: 'hasOne',
    type: 'meetings',
  },
  list: {
    jsonApi: 'hasOne',
    type: 'lists',
  },
}

export default meetingFollowups
