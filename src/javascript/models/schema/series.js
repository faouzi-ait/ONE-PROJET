const series = {
  'active': '',
  'asset-materials-count': '',
  'created-at': '',
  'data': '',
  'description': '',
  'episodes-count': '',
  'has-assets': '',
  'has-description': '',
  'name': '',
  'position': '',
  'programme-id': '',
  'programme-name': '',
  'restricted': '',
  'show-in-programme-description': '',
  'short-description': '',
  'remove-image': '',
  'programme-title-with-genre': '',
  'video-count': '',
  'number-of-episodes': '',
  'manual-number-of-episodes': '',
  'external-id': '',
  'updatable': '',
  'videos-count': '',
  'release-date': '',
  'custom-attributes': {
    'jsonApi': 'hasMany',
    'type': 'custom-attributes'
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
  'episodes': {
    'jsonApi': 'hasMany',
    'type': 'episode'
  },
  'videos': {
    'jsonApi': 'hasMany',
    'type': 'videos'
  },
  'programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  },
  'production-companies-series': {
    'jsonApi': 'hasMany',
    'type': 'production-companies-series',
    'mirage': {
      'inverse': 'production-companies-series'
    }
  },
  'series-talents': {
    'jsonApi': 'hasMany',
    'type': 'series-talents'
  },
  'series-images': {
    'jsonApi': 'hasMany',
    'type': 'series-image'
  },
  'broadcasters': {
    'jsonApi': 'hasMany',
    'type': 'broadcasters'
  },
  'series-broadcasters': {
    'jsonApi': 'hasMany',
    'type': 'series-broadcasters',
    'mirage': {
      'inverse': 'series-broadcasters',
    }
  },
}

export default series