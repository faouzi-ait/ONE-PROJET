const seriesBroadcasters = {
  position: '',
  series: {
    'jsonApi': 'hasOne',
    'type': 'series',
    'mirage': {
      'inverse': 'series',
    }
  },
  'broadcaster': {
    'jsonApi': 'hasOne',
    'type': 'broadcasters',
    'mirage': {
      'inverse': 'broadcasters',
    }
  },
}

export default seriesBroadcasters