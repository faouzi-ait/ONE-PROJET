import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class RecipientsOfScreenerStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'REPORTS_BY_PRODUCER_RECIPIENTS_OF_SCREENER'
    })
  }

}

const store = new RecipientsOfScreenerStore
Dispatcher.register(store.handleActions.bind(store))
export default store
