import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class Event extends StoreHelper {

  constructor() {
    super({
      resourceName: 'EVENT'
    })
  }

  UPDATED_EVENT = (action) => {
    this.emit('save')
  }

  DUPLICATED_EVENT = () => {
    this.emit('refresh')
  }

}

const store = new Event
Dispatcher.register(store.handleActions.bind(store))
export default store
