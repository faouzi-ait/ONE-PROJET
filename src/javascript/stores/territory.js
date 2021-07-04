import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TerritoryStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TERRITORY'
    })
  }

}

const store = new TerritoryStore
Dispatcher.register(store.handleActions.bind(store))
export default store
