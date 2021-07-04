import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeSearchResultStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME_SEARCH_RESULT'
    })

    this.query = {}
  }

  SAVE_PROGRAMME_QUERY = (action) => {
    this.query = action.query
    this.emit('querySaved')
  }

  getQuery() {
    return this.query
  }
}

const store = new ProgrammeSearchResultStore
Dispatcher.register(store.handleActions.bind(store))
export default store
