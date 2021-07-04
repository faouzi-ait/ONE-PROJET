import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class MetadataService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'meta-datum'
    this.jsonApi.define('meta-datum', modelData.metaData)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('page', modelData.pages)
    this.jsonApi.define('collection', modelData.collections)
  }
}

const service = new MetadataService
export default service
