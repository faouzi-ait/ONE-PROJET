const contentPositions = {
  'content-positionable-id': '',
  'content-positionable-type': '',
  'navigation-context': '',
  'parent-id': '',
  'position': '',
  'updated-at': '',
  'content-positionable': {
    'jsonApi': 'hasOne'
  },
  'sub-items': {
    'jsonApi': 'hasMany',
    'type': 'content-position'
  },
  'parent': {
    'jsonApi': 'hasOne',
    'type': 'content-position'
  }
}

export default contentPositions

