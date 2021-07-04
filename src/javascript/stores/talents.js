import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TalentsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TALENT'
    })
  }

}

const store = new TalentsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
