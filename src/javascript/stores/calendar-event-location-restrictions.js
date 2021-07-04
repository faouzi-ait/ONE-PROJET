import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class LocationsRestrictionStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LOCATION_RESTRICTION'
    })
  }

}

const store = new LocationsRestrictionStore
Dispatcher.register(store.handleActions.bind(store))
export default store
