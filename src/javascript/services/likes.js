import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class LikeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'like'
    this.jsonApi.define('like', modelData.likes)
    // mono-repo: What are these doing? Where is definition coming from.
    // this.jsonApi.define('list-programme')
    // this.jsonApi.define('list-series')
    // this.jsonApi.define('list-video')
  }
}

const service = new LikeService
export default service
