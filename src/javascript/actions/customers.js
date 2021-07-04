import API from 'javascript/services/customers'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CustomerApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOMER'
  }
}

API.actions = new CustomerApiActions

class CustomerViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOMER'
    this.API = API
  }
}

const actions = new CustomerViewActions
export default actions