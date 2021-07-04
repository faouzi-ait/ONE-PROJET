import API from 'javascript/services/private-video-views'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class PrivateVideoViewsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRIVATE_VIDEO_VIEW'
  }
}

API.actions = new PrivateVideoViewsApiActions

class PrivateVideoViewsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRIVATE_VIDEO_VIEW'
    this.API = API
  }
}

const actions = new PrivateVideoViewsViewActions
export default actions