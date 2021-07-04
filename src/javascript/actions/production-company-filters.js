import API from 'javascript/services/production-company-filters'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProductionCompanyFilterApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRODUCTION_COMPANY_FILTER'
  }
}

API.actions = new ProductionCompanyFilterApiActions

class ProductionCompanyFilterViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRODUCTION_COMPANY_FILTER'
    this.API = API
  }
}

const actions = new ProductionCompanyFilterViewActions
export default actions
