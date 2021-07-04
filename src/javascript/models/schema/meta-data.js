const metaData = {
  'title': '',
  'keywords': '',
  'description': '',
  'news-article': {
    'jsonApi': 'hasOne',
    'type': 'news-articles'
  },
  'programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes',
    'mirage': {
      'inverse': 'programmes'
    }
  },
  'page': {
    'jsonApi': 'hasOne',
    'type': 'pages',
    'mirage': {
      'inverse': 'pages'
    }
  },
  'collection': {
    'jsonApi': 'hasOne',
    'type': 'collections',
    'mirage': {
      'inverse': 'collections'
    }
  },
  'catalogue': {
    'jsonApi': 'hasOne',
    'type': 'catalogues'
  }
}

export default metaData
