import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TalentTypesService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'talent-type'
    this.jsonApi.define('talent-type', modelData.talentTypes)
  }
}

const service = new TalentTypesService
export default service
