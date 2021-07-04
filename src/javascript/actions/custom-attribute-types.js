import API from 'javascript/services/custom-attribute-types'
import Dispatcher from 'javascript/dispatcher'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CustomAttributeTypeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOM_ATTRIBUTE_TYPE'
  }
  positionUpdated(resource) {
    Dispatcher.dispatch({
      type: `UPDATED_${this.resourceName}_POSITION`,
      resource: resource
    })
  }
}

API.actions = new CustomAttributeTypeApiActions

class CustomAttributeTypeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CUSTOM_ATTRIBUTE_TYPE'
    this.API = API
  }
  updatePosition(resource) {
    this.API.updatePosition(resource)
  }
}

const actions = new CustomAttributeTypeViewActions
export default actions
