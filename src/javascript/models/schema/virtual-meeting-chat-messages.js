const virtualMeetingChatMessages = {
  'body': '',
  'virtual-meeting': {
    'jsonApi': 'hasOne',
    'type': 'virtual-meetings'
  },
  'attendee': {
    'jsonApi': 'hasOne',
    'type': 'virtual-meeting-attendees'
  }
}

export default virtualMeetingChatMessages