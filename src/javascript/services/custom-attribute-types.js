import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CustomAttributeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'custom-attribute-type'
    this.jsonApi.define('custom-attribute-type', modelData.customAttributeTypes)
    this.jsonApi.define('custom-attribute', modelData.customAttributes)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('series', modelData.series)
  }

  updatePosition(resource) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.positionUpdated(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new CustomAttributeService
export default service
