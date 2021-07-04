import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CustomAttributeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'custom-attribute'
    this.jsonApi.define('custom-attribute',  modelData.customAttributes)
    this.jsonApi.define('custom-attribute-type',  modelData.customAttributeTypes)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('series', modelData.series)
  }

  updateResource(resource, callback) {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.resourceUpdated(response)
      if (callback) {
        callback()
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  createResource(resource, callback) {
    this.jsonApi.create(this.resourceName, resource).then((response) => {
      this.actions.resourceCreated(response)
      if (callback) {
        callback()
      }
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new CustomAttributeService
export default service
