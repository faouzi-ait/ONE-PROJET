const productionCompaniesProgrammes = {
  position: '',
  'programme-id': '',
  'production-company-id': '',
  programme: {
    jsonApi: 'hasOne',
    type: 'programmes',
    'mirage': {
      inverse: 'production-companies-programmes',
    }
  },
  'production-company': {
    jsonApi: 'hasOne',
    type: 'production-companies',
    'mirage': {
      inverse: 'production-companies-programmes',
    }
  },
}

export default productionCompaniesProgrammes
