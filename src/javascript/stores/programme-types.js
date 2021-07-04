import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeTypesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME-TYPE'
    })
  }

}

const store = new ProgrammeTypesStore
Dispatcher.register(store.handleActions.bind(store))
export default store
