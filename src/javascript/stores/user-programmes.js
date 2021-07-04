import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class UserProgrammeStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'USER_PROGRAMME'
    })
  }

}

const store = new UserProgrammeStore
Dispatcher.register(store.handleActions.bind(store))
export default store
