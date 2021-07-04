import API from 'javascript/services/list-programme-notes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListProgrammeNotesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_PROGRAMME_NOTE'
  }
}

API.actions = new ListProgrammeNotesApiActions

class ListProgrammeNotesActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_PROGRAMME_NOTE'
    this.API = API
  }
}

const actions = new ListProgrammeNotesActions
export default actions
