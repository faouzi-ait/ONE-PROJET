import API from 'javascript/services/likes'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class LikeApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIKE'
  }
}

API.actions = new LikeApiActions

class LikeViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'LIKE'
    this.API = API
  }
}

const actions = new LikeViewActions
export default actions
