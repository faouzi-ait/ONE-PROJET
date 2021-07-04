import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TeamsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TEAM'
    })
  }

}

const store = new TeamsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
