import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ContentPositionStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'CONTENT_POSITION'
    })
  }

  UPDATED_CONTENT_POSITION = () => {
    this.emit('save')
  }
}

const store = new ContentPositionStore
Dispatcher.register(store.handleActions.bind(store))
export default store
