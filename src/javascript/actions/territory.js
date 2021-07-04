import API from 'javascript/services/territory'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TerritoryApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TERRITORY'
  }
}

API.actions = new TerritoryApiActions

class TerritoryViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TERRITORY'
    this.API = API
  }
}

const actions = new TerritoryViewActions
export default actions
