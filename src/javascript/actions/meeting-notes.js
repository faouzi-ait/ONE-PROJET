import API from 'javascript/services/meeting-notes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class MeetingNotesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MEETING_NOTE'
  }
}

API.actions = new MeetingNotesApiActions

class MeetingNotesViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'MEETING_NOTE'
    this.API = API
  }
}

const actions = new MeetingNotesViewActions
export default actions
