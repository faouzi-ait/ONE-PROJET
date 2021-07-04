import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class LanguageStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LANGUAGE'
    })
  }

}

const store = new LanguageStore
Dispatcher.register(store.handleActions.bind(store))
export default store
