import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class DataImportStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'DATA_IMPORT'
    })
  }

}

const store = new DataImportStore
Dispatcher.register(store.handleActions.bind(store))
export default store
