import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class AssetCategoryService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'asset-category'
    this.jsonApi.define('asset-category', modelData.assetCategories)
  }
}

const service = new AssetCategoryService
export default service
