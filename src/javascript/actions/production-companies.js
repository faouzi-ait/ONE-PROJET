import API from 'javascript/services/production-companies'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProductionCompanyApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRODUCTION_COMPANY'
  }
}

API.actions = new ProductionCompanyApiActions

class ProductionCompanyViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRODUCTION_COMPANY'
    this.API = API
  }

  updateResource(resource, attributes) {
    return this.API.updateResource(resource, attributes)
  }

  createResource(resource, attributes) {
    return this.API.createResource(resource, attributes)
  }

}

const actions = new ProductionCompanyViewActions
export default actions