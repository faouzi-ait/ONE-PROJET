import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class QualityStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'QUALITY'
    })
  }

}

const store = new QualityStore
Dispatcher.register(store.handleActions.bind(store))
export default store
