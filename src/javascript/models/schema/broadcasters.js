const broadcasters = {
  'external-id': '',
  'name': '',
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes',
    'mirage': {
      'inverse': 'programmes'
    }
  },
  'series': {
    'jsonApi': 'hasMany',
    'type': 'series',
    'mirage': {
      'inverse': 'series'
    }
  },
  'programme-broadcasters': {
    'jsonApi': 'hasMany',
    'type': 'programme-broadcasters',
    'mirage': {
      'inverse': 'programme-broadcasters',
    }
  },
  'series-broadcasters': {
    'jsonApi': 'hasMany',
    'type': 'series-broadcasters',
    'mirage': {
      'inverse': 'series-broadcasters',
    }
  },
}

export default broadcasters