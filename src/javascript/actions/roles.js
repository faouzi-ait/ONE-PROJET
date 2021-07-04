import API from 'javascript/services/roles'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class RoleApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ROLE'
  }
}

API.actions = new RoleApiActions

class RoleViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ROLE'
    this.API = API
  }
}

const actions = new RoleViewActions
export default actions
