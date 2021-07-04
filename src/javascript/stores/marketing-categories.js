import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class MarketingCategoryStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'MARKETING_CATEGORY'
    })
  }

  unsetResources() {
    this.resources = null
  }

}

const store = new MarketingCategoryStore
Dispatcher.register(store.handleActions.bind(store))
export default store