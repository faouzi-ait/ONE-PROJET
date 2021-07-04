import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class ApprovalsService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'approval'
    this.jsonApi.define('approval', modelData.approvals)
    this.jsonApi.define('user', modelData.users)
    this.jsonApi.define('company', modelData.companies)
    this.jsonApi.define('territory', modelData.territories)
  }
}

const service = new ApprovalsService
export default service
