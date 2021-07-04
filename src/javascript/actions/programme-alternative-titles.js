import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/programme-alternative-titles'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ProgrammeAlternativeTitlesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_ALTERNATIVE_TITLE'
  }
  receiveResource(resource) {
    Dispatcher.dispatch({
      type: 'RECEIVED_PROGRAMME_ALTERNATIVE_TITLE_BY_ID',
      resource: resource
    })
  }
}

API.actions = new ProgrammeAlternativeTitlesApiActions

class ProgrammeAlternativeTitlesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PROGRAMME_ALTERNATIVE_TITLE'
    this.API = API
  }

  updateResource(resource, attributes) {
    this.API.updateResource(resource, attributes)
  }

  createResource(resource, attributes) {
    this.API.createResource(resource, attributes)
  }

}

const actions = new ProgrammeAlternativeTitlesViewActions
export default actions
