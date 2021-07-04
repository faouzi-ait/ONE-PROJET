const genres =  {
  'name': '',
  'position': '',
  'parent-id': '',
  'parent-name': '',
  'programmes-count': '',
  'active-programmes-count': '',
  'image': '',
  'remove-image': '',
  'show-in-registration': '',
  'sub-genres': {
    'jsonApi': 'hasMany',
    'type': 'genres'
  },
  'sub-genres-with-programmes-for-user': {
    'jsonApi': 'hasMany',
    'type': 'genres'
  },
  // 'parent': {
  //   'jsonApi': 'hasOne',
  //   'type': 'genres'
  // },
  'featured-programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  }
}

export default genres