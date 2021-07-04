import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class CustomAttributeStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'CUSTOM_ATTRIBUTE'
    })
  }

}

const store = new CustomAttributeStore
Dispatcher.register(store.handleActions.bind(store))
export default store
