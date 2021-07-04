import API from 'javascript/services/list-series'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListSeriesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_SERIES'
  }
}

API.actions = new ListSeriesApiActions

class ListSeriesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_SERIES'
    this.API = API
  }
}

const actions = new ListSeriesViewActions
export default actions
