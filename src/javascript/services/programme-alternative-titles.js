import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ProgrammeAlternativeTitleService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'programme-alternative-title'
    this.jsonApi.define('programme-alternative-title', modelData.programmeAlternativeTitles)
  }
}

const service = new ProgrammeAlternativeTitleService
export default service
