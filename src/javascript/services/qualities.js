import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class QualityService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'quality'
    this.jsonApi.define('quality', modelData.qualities)
  }
}

const service = new QualityService
export default service
