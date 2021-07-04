import API from 'javascript/services/list-shares'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListSharesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_SHARE'
  }
}

API.actions = new ListSharesApiActions

class ListSharesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_SHARE'
    this.API = API
  }
}

const actions = new ListSharesViewActions
export default actions
