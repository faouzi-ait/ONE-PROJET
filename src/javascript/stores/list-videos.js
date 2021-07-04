import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListVideosStore extends StoreHelper {
  constructor() {
    super({ resourceName: 'LIST_VIDEOS' })
  }
}

const store = new ListVideosStore
Dispatcher.register(store.handleActions.bind(store))
export default store