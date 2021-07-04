import API from 'javascript/services/metadata'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class MetadataApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'METADATA'
  }
}

API.actions = new MetadataApiActions

class MetadataViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'METADATA'
    this.API = API
  }
}

const actions = new MetadataViewActions
export default actions
