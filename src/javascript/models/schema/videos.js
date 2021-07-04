const videos = {
  'created-at': '',
  'brightcove-id': '',
  'knox-uuid': '',
  'mp4-url': '', // restricted - only available to manage_videos || manage_programmes user
  'jwplayer-id': '',
  'name': '',
  'parent-position': '',
  'position': '',
  'poster': '',
  'programme-id': '',
  'programme-name': '',
  'programme-slug': '',
  'episode-id': '',
  'episode-name': '',
  'public-video': '',
  'downloadable': '',
  'status': '',
  'series-id': '',
  'series-name': '',
  'wistia-id': '',
  'wistia-thumbnail-url': '',
  'external-id': '',
  'upload-status': '',
  'programme-title-with-genre': '',
  'parent-type': '',
  'parent-id': '',
  'remove-poster': '',
  'restricted': '',
  'promo-video-programmes-count': '',
  'video-banner-programmes-count': '',
  'comcast-platform-id': '',
  'visibility': '',
  'parent': {
    'jsonApi': 'hasOne'
  },
  'restricted-users': {
    'jsonApi': 'hasMany',
    'type': 'users'
  },
  'languages': {
    'jsonApi': 'hasMany',
    'type': 'languages'
  },
  'restricted-companies': {
    'jsonApi': 'hasMany',
    'type': 'companies'
  },
  'restricted-groups': {
    'jsonApi': 'hasMany',
    'type': 'groups'
  },
  'private-video-accesses': {
    'jsonApi': 'hasMany',
    'type': 'private-video-access',
    'mirage': {
      'inverse': 'private-video-accesses'
    }
  },
  'video-type': {
    'jsonApi': 'hasOne',
    'type': 'video-types',
    'mirage': {
      'inverse': 'video-types'
    }
  }
}

export default videos