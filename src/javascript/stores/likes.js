import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class LikeStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIKE'
    })
  }

}

const store = new LikeStore
Dispatcher.register(store.handleActions.bind(store))
export default store
