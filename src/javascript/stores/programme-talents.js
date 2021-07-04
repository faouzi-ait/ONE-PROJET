import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeTalentsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME_TALENT'
    })
  }

}

const store = new ProgrammeTalentsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
