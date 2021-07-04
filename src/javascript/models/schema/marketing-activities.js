const marketingActivities = {
  'date': '',
  'description': '',
  'marketing-category': {
    'jsonApi': 'hasOne',
    'type': 'marketing-categories'
  },
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
  }
}

export default marketingActivities
