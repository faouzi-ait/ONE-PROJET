import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class UserProgrammeService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'user-programme'
    this.jsonApi.define('user-programme', modelData.userProgrammes)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('genre', modelData.genres)
    this.jsonApi.define('custom-attribute', modelData.customAttributes)
    this.jsonApi.define('custom-attribute-type', modelData.customAttributeTypes)
  }
}

const service = new UserProgrammeService
export default service
