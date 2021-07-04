const restrictedVideoUsers = {
  'expires-after': '',
  'restricted-video': {
    jsonApi: 'hasOne',
    type: 'videos',
  },
  'restricted-user': {
    jsonApi: 'hasOne',
    type: 'users',
  },
}

export default restrictedVideoUsers
