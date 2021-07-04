const newsArticles = {
  'banner-urls': '',
  'content-blocks': '',
  'enable-sharing': '',
  'featured': '',
  'introduction': '',
  'publish-date': '',
  'slug': '',
  'status': '',
  'thumbnail-urls': '',
  'title': '',
  'news-categories': {
    'jsonApi': 'hasMany',
    'type': 'news-categories'
  },
  'page-images': {
    'jsonApi': 'hasMany',
    'type': 'page-images'
  },
  'meta-datum': {
    'jsonApi': 'hasOne',
    'type': 'meta-data'
  },
  'responsive-images': {
    'jsonApi': 'hasMany',
    'type': 'responsive-images'
  },
  'images': {
    'jsonApi': 'hasMany',
    'type': 'images'
  }
}

export default newsArticles

