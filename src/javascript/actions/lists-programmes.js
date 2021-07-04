import API from 'javascript/services/lists-programmes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListProgrammeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_PROGRAMME'
  }
}

API.actions = new ListProgrammeApiActions

class ListProgrammeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_PROGRAMME'
    this.API = API
  }
}

const actions = new ListProgrammeViewActions
export default actions
