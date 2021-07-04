import API from 'javascript/services/asset-access-reports'
import pluralize from 'pluralize'
import Dispatcher from 'javascript/dispatcher'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class AssetAccessReportsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ASSET_ACCESS_REPORTS'
  }
  receiveResources(resources) {
    Dispatcher.dispatch({
      type: `RECEIVED_${pluralize(this.resourceName)}`,
      resources
    })
  }
}

API.actions = new AssetAccessReportsApiActions

class AssetAccessReportsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ASSET_ACCESS_REPORTS'
    this.API = API
  }
	getResources(...params) {
    this.API.getResources(...params)
  }
  exportResources(query, name){
    this.API.exportResources(query, name)
  }
}

const actions = new AssetAccessReportsViewActions
export default actions

