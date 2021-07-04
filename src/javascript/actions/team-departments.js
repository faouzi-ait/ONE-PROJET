import API from 'javascript/services/team-departments'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TeamDepartmentsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM_DEPARTMENT'
  }
}

API.actions = new TeamDepartmentsApiActions

class TeamDepartmentsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TEAM_DEPARTMENT'
    this.API = API
  }
}

const actions = new TeamDepartmentsViewActions
export default actions
