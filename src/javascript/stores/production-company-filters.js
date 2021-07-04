import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProductionCompanyFilterStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PRODUCTION_COMPANY_FILTER'
    })
  }
}

const store = new ProductionCompanyFilterStore
Dispatcher.register(store.handleActions.bind(store))
export default store
