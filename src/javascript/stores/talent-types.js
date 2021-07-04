import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class TalentTypesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'TALENT_TYPE'
    })
  }

}

const store = new TalentTypesStore
Dispatcher.register(store.handleActions.bind(store))
export default store
