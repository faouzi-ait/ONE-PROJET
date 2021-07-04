import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/meetings'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class MeetingApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MEETING'
  }
  updatedMeetings() {
    Dispatcher.dispatch({
      type: 'UPDATED_MEETINGS'
    })
  }
  checkedIn(resource) {
    Dispatcher.dispatch({
      type: 'MEETING_CHECKED_IN',
      resource: resource
    })
  }
}

API.actions = new MeetingApiActions

class MeetingViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MEETING'
    this.API = API
  }

  createResource = (resource, attendees) => {
    this.API.createResource(resource, attendees)
  }

  updateResource = (resource, attendees) => {
    this.API.updateResource(resource, attendees)
  }

  checkIn = (resource) => {
    this.API.checkIn(resource)
  }
}

const actions = new MeetingViewActions
export default actions
