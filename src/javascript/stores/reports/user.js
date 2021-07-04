import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class UserStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'REPORTS_USER'
    })
  }

}

const store = new UserStore
Dispatcher.register(store.handleActions.bind(store))
export default store