import API from 'javascript/services/events'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'
import Dispatcher from 'javascript/dispatcher'

class EventApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'EVENT'
  }

  eventDuplicated = () => {
    Dispatcher.dispatch({
      type: 'DUPLICATED_EVENT'
    })
  }
}

API.actions = new EventApiActions

class EventViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'EVENT'
    this.API = API
  }

  sendInvites = resource => {
    this.API.sendInvites(resource)
  }

  duplicate = id => {
    this.API.duplicate(id)
  }
}

const actions = new EventViewActions
export default actions
