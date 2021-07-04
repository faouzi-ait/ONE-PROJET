import API from 'javascript/services/watermarked-video-downloads'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class WatermarkedVideoDownloadApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'WATERMARKED_VIDEO_DOWNLOADS'
  }
}

API.actions = new WatermarkedVideoDownloadApiActions

class WatermarkedVideoDownloadViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'WATERMARKED_VIDEO_DOWNLOADS'
    this.API = API
  }
}

const actions = new WatermarkedVideoDownloadViewActions
export default actions
