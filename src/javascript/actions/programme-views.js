import API from 'javascript/services/programme-views'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeViewsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_VIEWS'
  }
}

API.actions = new ProgrammeViewsApiActions

class ProgrammeViewsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_VIEWS'
    this.API = API
  }
}

const actions = new ProgrammeViewsViewActions
export default actions
