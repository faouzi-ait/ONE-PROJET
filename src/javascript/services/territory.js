import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TerritoryService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'territory'
    this.jsonApi.define('territory', modelData.territories)
    this.jsonApi.define('user', modelData.users)
  }
}

const service = new TerritoryService
export default service
