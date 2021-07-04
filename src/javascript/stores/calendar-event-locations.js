import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class LocationsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LOCATION'
    })
  }

}

const store = new LocationsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
