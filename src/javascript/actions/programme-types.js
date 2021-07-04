import API from 'javascript/services/programme-types'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeTypeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME-TYPE'
  }
}

API.actions = new ProgrammeTypeApiActions

class ProgrammeTypeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME-TYPE'
    this.API = API
  }
}

const actions = new ProgrammeTypeViewActions
export default actions
