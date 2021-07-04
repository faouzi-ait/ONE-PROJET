import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class PagesStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PAGE'
    })
  }

  UPDATED_PAGE = () => {
    this.emit('refreshStore')
  }

  CREATED_PAGE = () => {
    this.emit('refreshStore')
  }

  DELETED_PAGE = () => {
    this.emit('refreshStore')
  }

  RECEIVED_PAGE_FILES = (action) => {
    this.resourceFiles = action.resource['page-images']
    this.emit('recievedFiles')
  }

  getResourceFiles() {
    return this.resourceFiles
  }

}

const store = new PagesStore
Dispatcher.register(store.handleActions.bind(store))
export default store
