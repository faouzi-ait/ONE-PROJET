import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TeamsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'team'
    this.jsonApi.define('team', modelData.teams)
  }
}

const service = new TeamsService
export default service
