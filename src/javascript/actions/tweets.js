import API from 'javascript/services/tweets'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class TweetApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TWEET'
  }
}

API.actions = new TweetApiActions

class TweetViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'TWEET'
    this.API = API
  }
}

const actions = new TweetViewActions
export default actions
