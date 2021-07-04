const programmeHighlightCategories = {
  'genre-id': '',
  'name': '',
  'position': '',
  'programme-highlights': {
    'jsonApi': 'hasMany',
    'type': 'programme-highlights'
  },
  'genre': {
    'jsonApi': 'hasOne',
    'type': 'genres'
  },
  'programme-highlight-page': {
    'jsonApi': 'hasOne',
    'type': 'programme-highlight-pages'
  },
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
  }
}

export default programmeHighlightCategories

