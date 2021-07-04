import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CustomAttributeTypeFilterService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'custom-attribute-type'
    this.jsonApi.define('custom-attribute-type', modelData.customAttributeTypes)
  }
}

const service = new CustomAttributeTypeFilterService
export default service
