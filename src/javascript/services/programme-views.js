import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ProgrammeViewsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme-view'
    this.jsonApi.define('programme-view', modelData.programmeViews)
    this.jsonApi.define('programme', modelData.programmes)
  }
}

const service = new ProgrammeViewsService
export default service