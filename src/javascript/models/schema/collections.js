const collections = {
  'title': '',
  'introduction': '',
  'banner-image': '',
  /* 'banner-image-urls': '',  deprecated - legacy for app */
  'banner-urls': '',
  'content-blocks': '',
  'default-order': '',
  'shareable': '',
  'sortable': '',
  'position': '',
  'published': '',
  'private-page': '',
  'slug': '',
  'pages-count': '',
  'show-in-nav': '',
  'show-in-featured-nav': '',
  'show-in-mega-nav': '',
  'show-in-footer': '',
  'banner-text-color': '',
  'updated-at': '',
  'page-images': {
    'jsonApi': 'hasMany',
    'type': 'page-images'
  },
  'pages': {
    'jsonApi': 'hasMany',
    'type': 'pages'
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

export default collections

