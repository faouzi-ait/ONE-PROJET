import API from 'javascript/services/asset-materials'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'
import Dispatcher from 'javascript/dispatcher'
import pluralize from 'pluralize'

class AssetMaterialApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ASSET_MATERIAL'
  }
  resourcesDeleted(resources) {
    Dispatcher.dispatch({
      type: `DELETED_${this.resourceName}S`,
      resources
    })
  }
  fileProgress(percent) {
    Dispatcher.dispatch({
      type: `${this.resourceName}_UPLOAD_PROGRESS`,
      percent: percent
    })
  }
  resourceSaved() {
    Dispatcher.dispatch({
      type: `${this.resourceName}_SAVED`,
    })
  }
  receiveResources(resources, id, requestCount) {
    Dispatcher.dispatch({
      type: `RECEIVED_${pluralize(this.resourceName)}`,
      resources,
      id,
      requestCount
    })
  }
  fileDownload(loaded) {
    Dispatcher.dispatch({
      type: `${this.resourceName}_DOWNLOAD_PROGRESS`,
      loaded: loaded
    })
  }
  fileDownloaded() {
    Dispatcher.dispatch({
      type: `${this.resourceName}_DOWNLOADED`
    })
  }
  resourcePermissionUpdate(resource){
    Dispatcher.dispatch({
      type: `${this.resourceName}_PERMISSION_UPDATED`,
      resource
    })
  }
}

API.actions = new AssetMaterialApiActions

class AssetMaterialViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'ASSET_MATERIAL'
    this.API = API
  }
  createResource(resource, files) {
    this.API.createResource(resource, files)
  }
  deleteResources(resources) {
    this.API.deleteResources(resources)
  }
  saveResource(resource, externalFileUrl) {
    this.API.saveResource(resource, externalFileUrl)
  }
  getResources(query, id) {
    this.API.getResources(query, id)
  }
  updateResourcePermissions(resource){
    this.API.updateResourcePermissions(resource)
  }
}

const actions = new AssetMaterialViewActions
export default actions
