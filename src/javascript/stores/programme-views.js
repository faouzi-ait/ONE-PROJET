import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeViewsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME_VIEWS'
    })
    this.slugResource = null
  }

  CREATED_PROGRAMME_VIEWS = (action) => {
    this.resources = this.resources || []
    this.resources.unshift(action.resource)
    this.resource = action.resource
    this.emit('start')
  }
}

const store = new ProgrammeViewsStore
Dispatcher.register(store.handleActions.bind(store))
export default store