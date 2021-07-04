const productionCompaniesSeries = {
  position: '',
  'series-id': '',
  'production-company-id': '',
  series: {
    jsonApi: 'hasOne',
    type: 'series',
    'mirage': {
      inverse: 'production-companies-series',
    }
  },
  'production-company': {
    jsonApi: 'hasOne',
    type: 'production-companies',
    'mirage': {
      inverse: 'production-companies-series',
    }
  },
}

export default productionCompaniesSeries
