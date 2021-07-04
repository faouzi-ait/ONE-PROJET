import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/programme-highlights'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeHighlightApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_HIGHLIGHT'
  }
  resourceCreated(response, resource) {
    response.programme = resource.programme
    Dispatcher.dispatch({
      type: `CREATED_${this.resourceName}`,
      resource: response
    })
  }
}

API.actions = new ProgrammeHighlightApiActions

class ProgrammeHighlightViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_HIGHLIGHT'
    this.API = API
  }
}

const actions = new ProgrammeHighlightViewActions
export default actions

