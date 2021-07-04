import API from 'javascript/services/video-downloads'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class VideoDownloadsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'VIDEO_DOWNLOAD_LINK'
  }
}

API.actions = new VideoDownloadsApiActions

class VideoDownloadsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'VIDEO_DOWNLOAD_LINK'
    this.API = API
  }
}

const actions = new VideoDownloadsViewActions
export default actions
