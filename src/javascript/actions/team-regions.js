import API from 'javascript/services/team-regions'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TeamRegionsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM_REGION'
  }
}

API.actions = new TeamRegionsApiActions

class TeamRegionsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM_REGION'
    this.API = API
  }
}

const actions = new TeamRegionsViewActions
export default actions
