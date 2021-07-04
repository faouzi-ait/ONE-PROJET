import API from 'javascript/services/approvals'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ApprovalsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'APPROVAL'
  }
}

API.actions = new ApprovalsApiActions

class ApprovalsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'APPROVAL'
    this.API = API
  }
}

const actions = new ApprovalsViewActions
export default actions
