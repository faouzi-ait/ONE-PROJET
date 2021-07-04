import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class TeamMembersService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'team-member'
    this.jsonApi.define('team-member', modelData.teamMembers)
    this.jsonApi.define('team-region', modelData.teamRegions)
    this.jsonApi.define('team-department', modelData.teamDepartments)
    this.jsonApi.define('team', modelData.teams)
  }

  uploadImage = (resource) => {
    this.jsonApi.update(this.resourceName, resource).then((response) => {
      this.actions.imageUploaded(response)
    }).catch((errors) => {
      this.actions.error(errors)
    })
  }
}

const service = new TeamMembersService
export default service
