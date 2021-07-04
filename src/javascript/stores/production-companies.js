import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProductionCompanyStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PRODUCTION_COMPANY'
    })
  }

  CREATED_PRODUCTION_COMPANY = (action) => {
    this.resource = action.resource.id
    this.emit('save')
  }

  UPDATED_PRODUCTION_COMPANY = (action) => {
    this.emit('save')
  }

}

const store = new ProductionCompanyStore
Dispatcher.register(store.handleActions.bind(store))
export default store
