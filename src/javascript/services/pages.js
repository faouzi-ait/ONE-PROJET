import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class PageService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'page'
    this.jsonApi.define('page', modelData.pages)
    this.jsonApi.define('collection', modelData.collections)
    this.jsonApi.define('page-image', modelData.pageImages)
    this.jsonApi.define('content-position', modelData.contentPositions)
    this.jsonApi.define('meta-datum', modelData.metaData)
  }

  getResourceFiles(id, query) {
    this.jsonApi.find(this.resourceName, id, query).then((response) => {
      this.actions.recievedResourceFiles(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new PageService
export default service
