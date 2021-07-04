const catalogues =  {
  'banner-urls': '',
  'content-blocks': '',
  'name': '',
  'programmes-count': '',
  'slug': '',
  'show-in-nav': '',
  'thumbnail-urls': '',
  'images': {
    'jsonApi': 'hasMany',
    'type': 'images'
  },
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
  },
  'responsive-images': {
    'jsonApi': 'hasMany',
    'type': 'responsive-images'
  },
  'meta-datum': {
    'jsonApi': 'hasOne',
    'type': 'meta-data'
  },
  'page-images': {
    'jsonApi': 'hasMany',
    'type': 'page-images'
  },
}

export default catalogues