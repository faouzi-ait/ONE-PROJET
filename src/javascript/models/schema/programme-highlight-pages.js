const programmeHighlightPages = {
  'banner-urls': '',
  'position': '',
  'title': '',
  'programme-highlights-count': '',
  'display-highlights-as-carousel': '',
  'display-subpages-as-carousel': '',
  'parent-highlight-page': {
    'jsonApi': 'hasOne',
    'type': 'programme-highlight-pages',
  },
  'programme-highlight-categories': {
    'jsonApi': 'hasMany',
    'type': 'programme-highlight-categories'
  },
  'programme-highlights': {
    'jsonApi': 'hasMany',
    'type': 'programme-highlights'
  },
  'responsive-images': {
    'jsonApi': 'hasMany',
    'type': 'responsive-images'
  },  
  'programme-highlight-pages': {
    'jsonApi': 'hasMany',
    'type': 'programme-highlight-pages',
  }
}

export default programmeHighlightPages
