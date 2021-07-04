import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class NewsCategoryStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'NEWS_CATEGORY'
    })
  }

}

const store = new NewsCategoryStore
Dispatcher.register(store.handleActions.bind(store))
export default store
