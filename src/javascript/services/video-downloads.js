import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class VideoDownloadsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'video-download-link'
    this.jsonApi.define('video-download-link', modelData.videoDownloadLinks)
    this.jsonApi.define('video', modelData.videos)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('series', modelData.series)
    this.jsonApi.define('episode', modelData.episodes)
  }
}

const service = new VideoDownloadsService
export default service
