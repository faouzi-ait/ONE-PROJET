import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class CompanyStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'COMPANY'
    })
  }

}

const store = new CompanyStore
Dispatcher.register(store.handleActions.bind(store))
export default store
