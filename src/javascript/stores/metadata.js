import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class MetadataStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'METADATA'
    })
  }

  CREATED_METADATA = (action) => {
    this.resource = action.resource
    this.emit('save')
  }

  UPDATED_METADATA = (action) => {
    this.resource = action.resource
    this.emit('save')
  }
}

const store = new MetadataStore
Dispatcher.register(store.handleActions.bind(store))
export default store
