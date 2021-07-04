import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'
import pluralize from 'pluralize'

class ProgrammeTypesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme-type'
    this.jsonApi.define('programme-type', modelData.programmeTypes)
  }

  search(query, callback) {
    this.jsonApi.findAll(`${pluralize(this.resourceName)}`, query).then((response) => {
      callback(response)
    })
  }
}

const service = new ProgrammeTypesService
export default service
