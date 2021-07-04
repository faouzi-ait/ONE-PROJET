import API from 'javascript/services/asset-categories'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class AssetCategoryApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ASSET_CATEGORY'
  }
}

API.actions = new AssetCategoryApiActions

class AssetCategoryViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ASSET_CATEGORY'
    this.API = API
  }
}

const actions = new AssetCategoryViewActions
export default actions