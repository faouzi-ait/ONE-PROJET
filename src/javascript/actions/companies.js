import API from 'javascript/services/companies'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CompanyApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'COMPANY'
  }
}

API.actions = new CompanyApiActions

class CompanyViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'COMPANY'
    this.API = API
  }
}

const actions = new CompanyViewActions
export default actions
