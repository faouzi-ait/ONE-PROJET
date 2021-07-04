import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class PrivateVideoAccessService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'private-video-access'
    this.jsonApi.define('private-video-access', modelData.privateVideoAccess)
  }
}

const service = new PrivateVideoAccessService
export default service
