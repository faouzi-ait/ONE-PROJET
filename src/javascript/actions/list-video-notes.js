import API from 'javascript/services/list-video-notes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListVideoNotesApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_VIDEO_NOTE'
  }
}

API.actions = new ListVideoNotesApiActions

class ListVideoNotesActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_VIDEO_NOTE'
    this.API = API
  }
}

const actions = new ListVideoNotesActions
export default actions
