import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ScreenersSentStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'REPORTS_BY_PRODUCER_SCREENERS_SENT'
    })
  }

}

const store = new ScreenersSentStore
Dispatcher.register(store.handleActions.bind(store))
export default store
