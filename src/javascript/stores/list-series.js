import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListSeriesStore extends StoreHelper {
  constructor() {
    super({ resourceName: 'LIST_SERIES' })
  }
}

const store = new ListSeriesStore
Dispatcher.register(store.handleActions.bind(store))
export default store