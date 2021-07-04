const productionCompanies = {
  'background-image': '',
  'country': '',
  'external-url': '',
  'external-id': '',
  'intro': '',
  'logo': '',
  'name': '',
  'programmes-count': '',
  'video': {
    'jsonApi': 'hasOne',
    'type': 'videos'
  },
  'custom-attributes': {
    'jsonApi': 'hasMany',
    'type': 'custom-attributes'
  },
  'production-companies-programmes': {
    'jsonApi': 'hasMany',
    'type': 'production-companies-programmes',
    'mirage': {
      'inverse': 'production-companies-programmes',
    }
  },
  'production-companies-series': {
    'jsonApi': 'hasMany',
    'type': 'production-companies-series',
    'mirage': {
      'inverse': 'production-companies-series',
    }
  },
}

export default productionCompanies