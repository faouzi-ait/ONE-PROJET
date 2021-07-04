import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeHighlightsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME_HIGHLIGHT'
    })
  }

  UPDATED_PROGRAMME_HIGHLIGHT = (action) => {
    this.emit('resourceUpdated')
  }

}

const store = new ProgrammeHighlightsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
