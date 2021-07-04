import API from 'javascript/services/qualities'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

import Dispatcher from 'javascript/dispatcher'
import pluralize from 'pluralize'

class QualityApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'QUALITY'
  }

  error(errors) {
    Dispatcher.dispatch({
      type: `${this.resourceName}_ERROR`,
      errors: errors
    })
  }
  receiveResources(resources) {
    Dispatcher.dispatch({
      type: `RECEIVED_${pluralize(this.resourceName)}`,
      resources: resources
    })
  }
  receiveResource(resource) {
    Dispatcher.dispatch({
      type: `RECEIVED_${this.resourceName}`,
      resource: resource
    })
  }
  resourceUpdated(resource) {
    Dispatcher.dispatch({
      type: `UPDATED_${this.resourceName}`,
      resource: resource
    })
  }

}

API.actions = new QualityApiActions

class QualityViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'QUALITY'
    this.API = API
  }

  getResources(query) {
    this.API.getResources(query)
  }

  updateResource(resource) {
    this.API.updateResource(resource)
  }

}

const actions = new QualityViewActions
export default actions
