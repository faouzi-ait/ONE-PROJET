import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TeamRegionsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'team-region'
    this.jsonApi.define('team-region', modelData.teamRegions)
  }
}

const service = new TeamRegionsService
export default service
