import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListVideosService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-video'
    this.jsonApi.define('list-video', modelData.listVideos)
    this.jsonApi.define('videos', modelData.videos)
    this.jsonApi.define('list', modelData.lists)
    // mono-repo: where is this definition coming from? api instance?
    // this.jsonApi.define('like')
  }
}

const service = new ListVideosService
export default service
