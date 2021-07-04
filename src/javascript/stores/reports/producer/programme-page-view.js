import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammePageViewStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'REPORTS_BY_PRODUCER_PROGRAMME_PAGE_VIEW'
    })
  }

}

const store = new ProgrammePageViewStore
Dispatcher.register(store.handleActions.bind(store))
export default store
