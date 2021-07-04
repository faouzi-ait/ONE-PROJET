import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/series'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class SeriesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'SERIES'
  }
  receiveResource(resource) {
    Dispatcher.dispatch({
      type: 'RECEIVED_SERIES_BY_ID',
      resource: resource
    })
  }
}

API.actions = new SeriesApiActions

class SeriesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'SERIES'
    this.API = API
  }

  updateResource(resource, attributes, talents) {
    this.API.updateResource(resource, attributes, talents)
  }

  updateResourcePosition(resource) {
    this.API.updateResourcePosition(resource)
  }

  createResource(resource, attributes, talents) {
    this.API.createResource(resource, attributes, talents)
  }

}

const actions = new SeriesViewActions
export default actions
