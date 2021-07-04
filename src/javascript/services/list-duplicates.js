import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ListDuplicatesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-duplicate'
    this.jsonApi.define('list-duplicate', modelData.listDuplicates)
  }
}

export default new ListDuplicatesService