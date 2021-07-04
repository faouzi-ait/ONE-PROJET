import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class PrivateVideoViewsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'private-video-view'
    this.jsonApi.define('private-video-view', modelData.privateVideoViews)
    this.jsonApi.define('video', modelData.videos)
  }
}

const service = new PrivateVideoViewsService
export default service
