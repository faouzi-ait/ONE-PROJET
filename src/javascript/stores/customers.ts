import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'
import { CustomerType } from 'javascript/types/ModelTypes'

class CustomersStore extends StoreHelper<CustomerType> {
  constructor() {
    super({
      resourceName: 'CUSTOMER',
    })
  }
}

const store = new CustomersStore()
Dispatcher.register(store.handleActions.bind(store))
export default store
