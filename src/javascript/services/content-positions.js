import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ContentPositionService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'content-position'
    this.jsonApi.define('content-position', modelData.contentPositions)
    this.jsonApi.define('collection', modelData.collections)
    this.jsonApi.define('page', modelData.pages)
  }
}

const service = new ContentPositionService
export default service
