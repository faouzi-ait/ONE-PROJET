import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class WatermarkedVideoService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'watermarked-video'
    this.jsonApi.define('watermarked-video', modelData.watermarkedVideos)
    this.jsonApi.define('videos', modelData.videos)
  }
}

const service = new WatermarkedVideoService
export default service