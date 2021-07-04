const programmeBroadcasters = {
  position: '',
  programme: {
    jsonApi: 'hasOne',
    type: 'programmes',
    'mirage': {
      inverse: 'programmes',
    }
  },
  'broadcaster': {
    jsonApi: 'hasOne',
    type: 'broadcasters',
    'mirage': {
      inverse: 'broadcasters',
    }
  },
}

export default programmeBroadcasters