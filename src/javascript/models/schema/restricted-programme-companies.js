const restrictedProgrammeCompany = {
  'expires-after': '',
  'restricted-programme': {
    jsonApi: 'hasOne',
    type: 'programmes',
  },
  'restricted-company': {
    jsonApi: 'hasOne',
    type: 'companies',
  },
}

export default restrictedProgrammeCompany
