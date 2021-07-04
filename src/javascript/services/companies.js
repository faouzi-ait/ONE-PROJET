import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import pluralize from 'pluralize'

class CompanyService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'company'
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('user', modelData.users)
  }
  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      callback(response)
    })
  }
}

const service = new CompanyService
export default service
