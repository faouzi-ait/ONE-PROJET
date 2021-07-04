import API from 'javascript/services/list-videos'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ListVideosApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_VIDEOS'
  }
}

API.actions = new ListVideosApiActions

class ListVideosViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIST_VIDEOS'
    this.API = API
  }
}

const actions = new ListVideosViewActions
export default actions
