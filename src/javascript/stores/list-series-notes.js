import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListSeriesNotesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIST_SERIES_NOTE'
    })
  }

}

const store = new ListSeriesNotesStore
Dispatcher.register(store.handleActions.bind(store))
export default store