import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeSearchSuggestionStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME_SEARCH_SUGGESTION'
    })
  }

}

const store = new ProgrammeSearchSuggestionStore
Dispatcher.register(store.handleActions.bind(store))
export default store
