import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListProgrammeNotesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIST_PROGRAMME_NOTE'
    })
  }

}

const store = new ListProgrammeNotesStore
Dispatcher.register(store.handleActions.bind(store))
export default store