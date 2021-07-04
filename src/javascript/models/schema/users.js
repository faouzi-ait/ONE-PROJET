const users = {
  'all-programmes-access': '',
  'all-videos-access': '',
  'approval-status': '',
  'external-id': '',
  'buyer-type': '',
  'company-name': '',
  'country-code': '',
  'created-at': '',
  'disable-approval-emails': '',
  'disable-registration-emails': '',
  'email': '',
  'external-id': '',
  'first-name': '',
  'full-name': '',
  'g-recaptcha-response': '',
  'has-production-companies': '',
  'image': '',
  'job-title': '',
  'last-name': '',
  'limited-access': '',
  'marketing': '',
  'meeting-attendee-id': '',
  'mobile-country-code': '',
  'mobile-number': '',
  'password': '',
  'password-confirmation': '',
  'remove-image': '',
  'suspended': '',
  'telephone-number': '',
  'title': '',
  'user-type': '',
  'account-manager': {
    'jsonApi': 'hasOne',
    'type': 'users'
  },
  'account-managers': {
    'jsonApi': 'hasMany',
    'type': 'users'
  },
  'company': {
    'jsonApi': 'hasOne',
    'type': 'companies'
  },
  'genres': {
    'jsonApi': 'hasMany',
    'type': 'genres'
  },
  'groups': {
    'jsonApi': 'hasMany',
    'type': 'groups'
  },
  'lists': {
    'jsonApi': 'hasMany',
    'type': 'lists'
  },
  'programmes': {
    'jsonApi': 'hasMany',
    'type': 'programmes'
  },
  'regions': {
    'jsonApi': 'hasMany',
    'type': 'regions'
  },
  'roles': {
    'jsonApi': 'hasMany',
    'type': 'roles'
  },
  'sales-coordinators': {
    'jsonApi': 'hasMany',
    'type': 'users'
  },
  'territories': {
    'jsonApi': 'hasMany',
    'type': 'territories'
  },
  'production-companies': {
    'jsonApi': 'hasMany',
    'type': 'production-companies'
  },
  'programme-types': {
    'jsonApi': 'hasMany',
    'type': 'programme-types'
  }
}

export default users