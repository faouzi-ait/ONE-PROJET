import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import CustomAttributeActions from 'javascript/actions/custom-attributes'
import pluralize from "pluralize";

class ProductionCompanyService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'production-company'
    this.jsonApi.define('production-company', modelData.productionCompanies)
    this.jsonApi.define('video', modelData.videos)

    this.jsonApi.define('custom-attribute', modelData.customAttributes)
    this.jsonApi.define('custom-attribute-type', modelData.customAttributeTypes)
  }

  createResource(resource, attributes) {
    return this.jsonApi.create(this.resourceName, resource).then((response) => {
      CustomAttributeActions.createAndAssociate(response, attributes, () => {
        this.actions.resourceCreated(response)
      })
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  updateResource(resource, attributes) {
    return this.jsonApi.update(this.resourceName, resource).then((response) => {
      CustomAttributeActions.createOrUpdate(attributes, () => {
        this.actions.resourceUpdated(response)
      })
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }

  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then(callback)
  }
}

const service = new ProductionCompanyService
export default service
