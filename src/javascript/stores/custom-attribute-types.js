import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class CustomAttributeTypeStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'CUSTOM_ATTRIBUTE_TYPE'
    })
  }

  UPDATED_CUSTOM_ATTRIBUTE_TYPE_POSITION = () => {
    this.emit('positionUpdated')
  }

}

const store = new CustomAttributeTypeStore
Dispatcher.register(store.handleActions.bind(store))
export default store
