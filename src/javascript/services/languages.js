import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class LanguageService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'language'
    this.jsonApi.define('language', modelData.languages)
    this.jsonApi.define('asset-material', modelData.assetMaterials)
  }
}

const service = new LanguageService
export default service
