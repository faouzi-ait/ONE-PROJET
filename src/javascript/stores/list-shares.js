import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListSharesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIST_SHARE'
    })
  }

}

const store = new ListSharesStore
Dispatcher.register(store.handleActions.bind(store))
export default store