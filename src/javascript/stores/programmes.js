import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ProgrammeStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PROGRAMME'
    })

    this.query = {}
  }

  CREATED_PROGRAMME = (action) => {
    this.resource = action.resource.id
    this.emit('save')
  }

  UPDATED_PROGRAMME = (action) => {
    this.emit('save')
  }

  RECEIVED_PROGRAMME_PAGE_FILES = (action) => {
    this.resourceFiles = action.resource['page-images']
    this.emit('recievedFiles')
  }

  SAVE_PROGRAMME_QUERY = (action) => {
    this.query = action.query
    this.emit('querySaved')
  }

  PROGRAMME_DUPLICATED = (action) => {
    this.resource = action.resource
    this.emit('duplicated')
  }

  PROGRAMME_EXPORTED = () => {
    this.emit('exported')
  }

  getQuery() {
    return this.query
  }

  getResourceFiles() {
    return this.resourceFiles
  }
}

const store = new ProgrammeStore
Dispatcher.register(store.handleActions.bind(store))
export default store
