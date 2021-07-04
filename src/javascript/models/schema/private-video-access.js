const privateVideoAccess = {
  'expiry-date': '',
  'video-id': '',
  'slug' : '',
  'password': '',
  'created-at': '',
  'video': {
    'jsonApi': 'hasOne',
    'type': 'videos',
    'mirage': {
      'inverse': 'videos'
    }
  },
}

export default privateVideoAccess

