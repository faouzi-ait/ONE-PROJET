import axios from 'axios'
import API from 'javascript/services/pages'
import Dispatcher from 'javascript/dispatcher'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class PageApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PAGE'
  }
  recievedResourceFiles(resource) {
    Dispatcher.dispatch({
      type: 'RECEIVED_PAGE_FILES',
      resource: resource
    })
  }
}

API.actions = new PageApiActions

class PageViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'PAGE'
    this.API = API
  }
  getResourceFiles(id, query) {
    this.API.getResourceFiles(id, query)
  }
  getTweets = (request) => {
    return axios({
      url: `https://api.twitter.com/1.1/statuses/user_timeline.json?${request}`,
      method: 'GET',
    }).then((response) => {
      Dispatcher.dispatch({
        type: 'TWITTER_LOADED',
        response
      })
      return response
    }).catch((errors) => {
      Dispatcher.dispatch({
        type: 'TWITTER_FAILED',
        errors
      })
    })
  }
}

const actions = new PageViewActions
export default actions
