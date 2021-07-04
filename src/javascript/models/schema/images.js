const images = {
  'name' : '',
  'variant' : '',
  'image': '',
  'image-data-uri': '',
  'remote-urls': '',
  'programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  },
  'customer': {
    'jsonApi': 'hasOne',
    'type': 'customers'
  },
  'news-article': {
    'jsonApi': 'hasOne',
    'type': 'news-articles'
  },
  'catalogue': {
    'jsonApi': 'hasOne',
    'type': 'catalogues'
  }
}

export default images