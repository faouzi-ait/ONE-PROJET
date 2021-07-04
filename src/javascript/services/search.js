import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class SearchService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'search'
    this.jsonApi.define('search', modelData.search)
  }

  getResources(query) {
    this.jsonApi.request(`${this.jsonApi.apiUrl}/${this.resourceName}`, 'GET', query).then((response) => {
      this.actions.receiveResources(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new SearchService
export default service
