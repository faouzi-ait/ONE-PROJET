import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListDuplicatesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIST_DUPLICATE'
    })
  }

}

const store = new ListDuplicatesStore
Dispatcher.register(store.handleActions.bind(store))
export default store