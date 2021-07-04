import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TeamDepartmentsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'team-department'
    this.jsonApi.define('team-department', modelData.teamDepartments)
  }
}

const service = new TeamDepartmentsService
export default service
