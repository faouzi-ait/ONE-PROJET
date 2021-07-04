const listShares = {
  'authorized-email-addresses' : '',
  'email-addresses': '',
  'message': '',
  'list': {
    'jsonApi': 'hasOne',
    'type': 'lists'
  },
  'users': {
    'jsonApi': 'hasMany',
    'type': 'users'
  },
  'authorized-users': {
    'jsonApi': 'hasMany',
    'type': 'users'
  },
}

export default listShares

