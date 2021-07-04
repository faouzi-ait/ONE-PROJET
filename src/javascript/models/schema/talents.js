const talents = {
  'firstname': '',
  'surname': '',
  'full-name': '',
  'programme-talents-count':'',
  'series-talents-count':'',
  'external-id': '',
  'updatedAt': '',
  'createdAt': '',
  'customerId': '',
  'talent-type': {
    'jsonApi': 'hasMany',
    'type': 'talent-type'
  },
  'customer': {
    'jsonApi': 'hasOne',
    'type': 'user'
  },
  'programme-talents': {
    'jsonApi': 'hasMany',
    'type': 'programme-talents'
  },
  'series-talents': {
    'jsonApi': 'hasMany',
    'type': 'series-talents'
  },
  'programmes': {
    'jsonApi': 'hasOne',
    'type': 'programmes'
  },
  'series': {
    'jsonApi': 'hasOne',
    'type': 'series'
  }
}

export default talents

