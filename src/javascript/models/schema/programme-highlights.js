const programmeHighlights = {
  'position': '',
  'programme-highlight-category-id': '',
  'programme-id': '',
  'programme': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  },
  'programme-highlight-category': {
    'jsonApi': 'hasOne',
    'type': 'programme-highlight-categories'
  },
  'programme-highlight-page': {
    'jsonApi': 'hasOne',
    'type': 'programme-highlight-pages'
  }
}

export default programmeHighlights

