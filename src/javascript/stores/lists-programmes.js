import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListProgrammeStore extends StoreHelper {
  constructor() {
    super({ resourceName: 'LIST_PROGRAMME' })
  }

  CREATED_LIST_PROGRAMME = (action) => {
    this.emit('resourceUpdated')
  }

  UPDATED_LIST_PROGRAMME = (action) => {
    this.emit('resourceUpdatedChange')
  }
}

const store = new ListProgrammeStore
Dispatcher.register(store.handleActions.bind(store))
export default store