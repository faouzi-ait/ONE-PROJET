import Dispatcher from 'javascript/dispatcher'
import pluralize from 'pluralize'
import API from 'javascript/services/collections'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class CollectionApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'COLLECTION'
  }
  receiveSlugResource = (resource) => {
    Dispatcher.dispatch({
      type: `RECEIVED_SLUG_${pluralize(this.resourceName)}`,
      resource
    })
  }
  recievedSiteMap = (resources) => {
    Dispatcher.dispatch({
      type: 'RECEIVED_SITEMAP',
      resources
    })
  }
}

API.actions = new CollectionApiActions

class CollectionViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'COLLECTION'
    this.API = API
  }

  getSlugResource(slug, query){
    this.API.getSlugResource(slug, query)
  }

  getSiteMap(query) {
    this.API.getSiteMap(query)
  }
}

const actions = new CollectionViewActions
export default actions
