import API from 'javascript/services/talents'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TalentsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TALENT'
  }
}

API.actions = new TalentsApiActions

class TalentsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TALENT'
    this.API = API
  }
}

const actions = new TalentsViewActions
export default actions
