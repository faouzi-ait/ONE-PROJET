const restrictedProgrammeUsers = {
  'expires-after': '',
  'restricted-programme': {
    jsonApi: 'hasOne',
    type: 'programmes',
  },
  'restricted-user': {
    jsonApi: 'hasOne',
    type: 'users',
  },
}

export default restrictedProgrammeUsers
