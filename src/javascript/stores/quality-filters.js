import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class QualityFilterStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'QUALITY_FILTER'
    })
  }

}

const store = new QualityFilterStore
Dispatcher.register(store.handleActions.bind(store))
export default store
