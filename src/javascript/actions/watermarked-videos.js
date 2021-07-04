import API from 'javascript/services/watermarked-videos'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class WatermarkedVideoApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'WATERMARKED_VIDEOS'
  }
}

API.actions = new WatermarkedVideoApiActions

class WatermarkedVideoViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'WATERMARKED_VIDEOS'
    this.API = API
  }
}

const actions = new WatermarkedVideoViewActions
export default actions
