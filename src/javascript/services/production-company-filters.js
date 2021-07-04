import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ProductionCompanyFilterService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'production-company'
    this.jsonApi.define('production-company', modelData.productionCompanies)
  }
}

const service = new ProductionCompanyFilterService
export default service
