import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ListStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'LIST'
    })
  }

  LIST_DUPLICATED = (action) => {
    this.emit('listDuplicated')
  }

  LIST_SHARED = (action) => {
    this.emit('listShared')
  }

  DELETED_LIST = (action) => {
    if(this.resources){
      const resources = this.resources.filter(({id}) => id !== action.resource.id)
      resources.links = this.resources.links || {}
      resources.meta = this.resources.meta || {}
      this.resources = resources
    }
    this.emit('listDeleted')
  }

}

const store = new ListStore
Dispatcher.register(store.handleActions.bind(store))
export default store