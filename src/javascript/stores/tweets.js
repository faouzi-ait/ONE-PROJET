import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TweetsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TWEET'
    })
    this.slugResource = null
  }
}

const store = new TweetsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
