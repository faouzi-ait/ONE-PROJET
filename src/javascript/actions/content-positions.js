import API from 'javascript/services/content-positions'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class ContentPositionApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CONTENT_POSITION'
  }
  
}

API.actions = new ContentPositionApiActions

class ContentPositionViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'CONTENT_POSITION'
    this.API = API
  }
  getResourceFiles(id, query) {
    this.API.getResourceFiles(id, query)
  }
}

const actions = new ContentPositionViewActions
export default actions
