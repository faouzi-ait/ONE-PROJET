const teamMembers = {
  'first-name': '',
  'last-name': '',
  'email': '',
  'job-title': '',
  'phone': '',
  'bio': '',
  'image': '',
  'manager': '',
  'position': '',
  'producer-hub': '',
  'team-region': {
    'jsonApi': 'hasOne',
    'type': 'team-regions'
  },
  'team-department': {
    'jsonApi': 'hasOne',
    'type': 'team-departments'
  },
  'team': {
    'jsonApi': 'hasOne',
    'type': 'teams'
  }
}

export default teamMembers

