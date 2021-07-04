import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListSharesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-share'
    this.jsonApi.define('list-share', modelData.listShares)
  }
}

export default new ListSharesService