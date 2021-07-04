const videoTypes = {
  'name': '',
  'videos-count': '',
  'video' : {
    'jsonApi': 'hasMany',
    'type' : 'videos',
    'mirage': {
      'inverse': 'videos'
    }
  },
}

export default videoTypes