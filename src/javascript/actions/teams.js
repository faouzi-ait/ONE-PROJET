import API from 'javascript/services/teams'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TeamsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM'
  }
}

API.actions = new TeamsApiActions

class TeamsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM'
    this.API = API
  }
}

const actions = new TeamsViewActions
export default actions
