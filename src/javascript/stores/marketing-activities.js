import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class MarketingActivityStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'MARKETING_ACTIVITY'
    })
  }

  unsetResources() {
    this.resources = null
  }

  CREATED_MARKETING_ACTIVITY = (action) => {
    this.emit('save')
  }
  
  UPDATED_MARKETING_ACTIVITY = (action) => {
    this.emit('save')
  }

  DELETED_MARKETING_ACTIVITY = (action) => {
    this.emit('save')
  }

}

const store = new MarketingActivityStore
Dispatcher.register(store.handleActions.bind(store))
export default store