import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class CustomAttributeTypeFilterStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'CUSTOM_ATTRIBUTE_TYPE_FILTER'
    })
  }
}

const store = new CustomAttributeTypeFilterStore
Dispatcher.register(store.handleActions.bind(store))
export default store
