import API from 'javascript/services/talent-types'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TalentTypesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TALENT_TYPE'
  }
}

API.actions = new TalentTypesApiActions

class TalentTypesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TALENT_TYPE'
    this.API = API
  }
}

const actions = new TalentTypesViewActions
export default actions
