const programmes = {
  'active-series-counter': '',
  'active': '',
  'asset-materials-count': '',
  /* 'banner-image-urls': '',  deprecated - legacy for app */
  'banner-urls': '',
  'banner': '',
  'content-blocks': '',
  'created-at': '',
  'data-sync': '',
  'data': '',
  'description': '',
  'external-id': '',
  'has-assets': '',
  'introduction': '',
  'logo': '',
  'manual-number-of-episodes': '',
  'manual-number-of-series': '',
  'meta-description': '',
  'new-release': '',
  'number-of-episodes': '',
  'number-of-series': '',
  'pdf-name': '',
  'pdf-url': '',
  'pdf': '',
  'production-end': '',
  'production-start': '',
  'promo-video-id': '',
  'publish-date': '',
  'release-date': '',
  'remove-banner': '',
  'remove-logo': '',
  'remove-pdf': '',
  'remove-thumbnail': '',
  'restricted': '',
  'series-count': '',
  'short-description': '',
  'show-related-programmes': '',
  'slug': '',
  'thumbnail': '',
  'title-with-genre': '',
  'title': '',
  'updatable': '',
  'videos-count': '',
  'visibility': '',
  'catalogues': {
    'jsonApi': 'hasMany',
    'type': 'catalogues',
  },
  'custom-attributes': {
    'jsonApi': 'hasMany',
    'type': 'custom-attributes'
  },
  'genres': {
    'jsonApi': 'hasMany',
    'type': 'genres'
  },
  'qualities': {
    'jsonApi': 'hasMany',
    'type': 'qualities'
  },
  'production-companies': {
    'jsonApi': 'hasMany',
    'type': 'production-companies'
  },
  'series': {
    'jsonApi': 'hasMany',
    'type': 'series',
    'mirage': {
      'inverse': 'series'
    }
  },
  'active-series': {
    'jsonApi': 'hasMany',
    'type': 'series'
  },
  'episodes': {
    'jsonApi': 'hasMany',
    'type': 'episodes'
  },
  'languages': {
    'jsonApi': 'hasMany',
    'type': 'languages'
  },
  'restricted-users': {
    'jsonApi': 'hasMany',
    'type': 'users'
  },
  'restricted-companies': {
    'jsonApi': 'hasMany',
    'type': 'companies'
  },
  'restricted-groups': {
    'jsonApi': 'hasMany',
    'type': 'groups'
  },
  'page-images': {
    'jsonApi': 'hasMany',
    'type': 'page-images'
  },
  'videos': {
    'jsonApi': 'hasMany',
    'type': 'videos'
  },
  'programme-alternative-titles': {
    'jsonApi': 'hasMany',
    'type': 'programme-alternative-titles'
  },
  'related-programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
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
    'type': 'responsive-images',
    'mirage': {
      'inverse': 'responsive-images'
    }
  },
  'video-banner': {
    'jsonApi': 'hasOne',
    'type': 'videos'
  },
  'programme-talents': {
    'jsonApi': 'hasMany',
    'type': 'programme-talents',
    'mirage': {
      'inverse': 'programme-talents'
    }
  },
  'programme-type': {
    'jsonApi': 'hasOne',
    'type': 'programme-types',
    'mirage': {
      'inverse': 'programme-types'
    }
  },
  'production-companies-programmes': {
    'jsonApi': 'hasMany',
    'type': 'production-companies-programmes',
    'mirage': {
      'inverse': 'production-companies-programmes'
    }
  },
  'format': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  },
  'format-programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
  },
  'broadcasters': {
    'jsonApi': 'hasMany',
    'type': 'broadcasters',
  },
  'programme-broadcasters': {
    'jsonApi': 'hasMany',
    'type': 'programme-broadcasters',
    'mirage': {
      'inverse': 'programme-broadcasters',
    }
  },
  'weighted-word': {
    'jsonApi': 'hasMany',
    'type': 'weighted-words',
    'mirage': {
      'inverse': 'weighted-words'
    }
  }
}

export default programmes











