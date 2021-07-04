import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import pluralize from 'pluralize'

class TalentsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'talent'
    this.jsonApi.define('talent', modelData.talents)
    this.jsonApi.define('talent-type', modelData.talentTypes)
  }

  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      callback(response)
    })
  }
}

const service = new TalentsService
export default service
