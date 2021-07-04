import API from 'javascript/services/user-programmes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class UserProgrammeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'USER_PROGRAMME'
  }
}

API.actions = new UserProgrammeApiActions

class UserProgrammeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'USER_PROGRAMME'
    this.API = API
  }
}

const actions = new UserProgrammeViewActions
export default actions