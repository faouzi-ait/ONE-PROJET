import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class WatermarkedVideoDownloadService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'watermarked-video-download'
    this.jsonApi.define('watermarked-video-download', modelData.watermarkedVideoDownloads)
  }
}

const service = new WatermarkedVideoDownloadService
export default service