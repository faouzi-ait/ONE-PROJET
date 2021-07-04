import API from 'javascript/services/list-duplicates'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListDuplicatesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_DUPLICATE'
  }
}

API.actions = new ListDuplicatesApiActions

class ListDuplicatesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_DUPLICATE'
    this.API = API
  }
}

const actions = new ListDuplicatesViewActions
export default actions
