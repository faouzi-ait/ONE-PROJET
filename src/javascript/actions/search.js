import API from 'javascript/services/search'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class SearchApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'SEARCH'
  }
}

API.actions = new SearchApiActions

class SearchViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'SEARCH'
    this.API = API
  }
}

const actions = new SearchViewActions
export default actions
