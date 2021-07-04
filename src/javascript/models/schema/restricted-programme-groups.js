const restrictedProgrammeGroups = {
  'expires-after': '',
  'restricted-programme': {
    jsonApi: 'hasOne',
    type: 'programmes',
  },
  'restricted-group': {
    jsonApi: 'hasOne',
    type: 'groups',
  },
}

export default restrictedProgrammeGroups
