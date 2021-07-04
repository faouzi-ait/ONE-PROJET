const pages = {
  'title': '',
  'introduction': '',
  'banner': '',
  /* 'banner-image-urls': '',  deprecated - legacy for app */
  'banner-urls': '',
  'thumbnail': '',
  'published-at': '',
  'shareable': '',
  'position': '',
  'content-blocks': '',
  'page-type': '',
  'published': '',
  'private-page': '',
  'remove-thumbnail': '',
  'redirect-url': '',
  'slug': '',
  'show-in-nav': '',
  'show-in-featured-nav': '',
  'show-in-mega-nav': '',
  'show-in-footer': '',
  'show-in-collection': '',
  'banner-text-color': '',
  'updated-at': '',
  'page-images': {
    'jsonApi': 'hasMany',
    'type': 'page-images'
  },
  'collection': {
    'jsonApi': 'hasOne',
    'type': 'collections'
  },
  'content-positions': {
    'jsonApi': 'hasOne',
    'type': 'content-position'
  },
  'meta-datum': {
    'jsonApi': 'hasOne',
    'type': 'meta-data',
    'mirage': {
      'inverse': 'meta-data'
    }
  },
  'responsive-images': {
    'jsonApi': 'hasMany',
    'type': 'responsive-images'
  },
}

export default pages

