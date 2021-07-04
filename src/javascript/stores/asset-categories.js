import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class AssetCategoryStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'ASSET_CATEGORY'
    })
  }

  unsetResources() {
    this.resources = null
  }

}

const store = new AssetCategoryStore
Dispatcher.register(store.handleActions.bind(store))
export default store
