import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/videos'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class VideoApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'VIDEO'
  }

  resourceSaved(resource) {
    Dispatcher.dispatch({
      type: 'VIDEO_SAVED'
    })
  }

  resourcePermissionUpdate(resource) { //cannot see this used anywhere (21/07/20) probably wants removing
    Dispatcher.dispatch({
      type: 'VIDEO_PERMISSION_UPDATED',
      resource
    })
  }
}

API.actions = new VideoApiActions

class VideoViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'VIDEO'
    this.API = API
  }

  saveResource(resource) {
    this.API.saveResource(resource)
  }

  deleteResource(resource, cb) {
    this.API.deleteResource(resource, cb)
  }

  resourceDeleted = API.actions.resourceDeleted

}

const actions = new VideoViewActions
export default actions
