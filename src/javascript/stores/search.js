import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class SearchStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'SEARCH'
    })
  }

}

const store = new SearchStore
Dispatcher.register(store.handleActions.bind(store))
export default store
