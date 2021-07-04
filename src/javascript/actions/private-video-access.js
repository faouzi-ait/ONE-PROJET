import API from 'javascript/services/private-video-access'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class PrivateVideoAccessApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRIVATE_VIDEO_ACCESS'
  }
}

API.actions = new PrivateVideoAccessApiActions

class PrivateVideoAccessViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PRIVATE_VIDEO_ACCESS'
    this.API = API
  }
}

const actions = new PrivateVideoAccessViewActions
export default actions