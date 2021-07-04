import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class RoleService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'role'
    this.jsonApi.define('role', modelData.roles)
    this.jsonApi.define('user', modelData.users)
  }
}

const service = new RoleService
export default service
