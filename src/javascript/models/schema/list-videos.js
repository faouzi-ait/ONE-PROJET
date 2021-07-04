const listVideos = {
  'list-position': '',
  'notes-count' : '',
  'screener': '',
  'programme-id': '',
  'programme-name': '',
  'programme-slug': '',
  'video-id': '',
  'video': {
    'jsonApi': 'hasOne',
    'type': 'videos'
  },
  'list-video-notes': {
    'jsonApi': 'hasMany',
    'type': 'video-notes'
  },
  'list': {
    'jsonApi': 'hasOne',
    'type': 'lists'
  },
  'like': {
    'jsonApi': 'hasOne',
    'type': 'likes'
  }
}

export default listVideos

