import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CompanyService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'list-programme'
    this.jsonApi.define('list-programme', modelData.listProgrammes)
    this.jsonApi.define('programme', modelData.programmes)
    this.jsonApi.define('list', modelData.lists)

    // mono-repo: where is this definition coming from? api instance?
    // this.jsonApi.define('user')

    /* #region  banijaygroup */
    this.jsonApi.define('genre', modelData.genres)
    /* #endregion */

    // mono-repo: where is this definition coming from? api instance?
    // this.jsonApi.define('like')
  }
}

const service = new CompanyService
export default service
