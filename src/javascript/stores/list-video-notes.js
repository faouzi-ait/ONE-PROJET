import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListVideoNotesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIST_VIDEO_NOTE'
    })
  }

}

const store = new ListVideoNotesStore
Dispatcher.register(store.handleActions.bind(store))
export default store