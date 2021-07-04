import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class CollectionsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'COLLECTION'
    })
    this.slugResource = null
  }

  UPDATED_COLLECTION = () => {
    this.emit('refreshStore')
  }

  CREATED_COLLECTION = () => {
    this.emit('refreshStore')
  }

  DELETED_COLLECTION = () => {
    this.emit('refreshStore')
  }

  RECEIVED_SLUG_COLLECTIONS = (action) => {
    this.slugResource = action.resource[0] || false
    this.emit('slug')
  }

  RECEIVED_SITEMAP = (action) => {
    this.sitemapResources = action.resources
    this.emit('sitemapChanged')
  }

  getSlugResource() {
    return this.slugResource
  }

  getSiteMapResource() {
    return this.sitemapResources
  }
}

const store = new CollectionsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
