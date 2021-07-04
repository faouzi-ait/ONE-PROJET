import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class LanguageFilterStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LANGUAGE_FILTER'
    })
  }

}

const store = new LanguageFilterStore
Dispatcher.register(store.handleActions.bind(store))
export default store
