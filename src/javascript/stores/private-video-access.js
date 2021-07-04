import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class PrivateVideoAccessStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PRIVATE_VIDEO_ACCESS'
    })
  }
  
  CREATED_PRIVATE_VIDEO_ACCESS = (action) => {
    this.resources = this.resources || []
    this.resources.unshift(action.resource)
    this.emit('save')
  }

  DELETED_PRIVATE_VIDEO_ACCESS = (action) => {
    if(this.resources){
      const resources = this.resources.filter(({id}) => id !== action.resource.id)
      resources.links = this.resources.links || {}
      resources.meta = this.resources.meta || {}
      this.resources = resources
    }
    this.emit('delete')
  }
}

const store = new PrivateVideoAccessStore
Dispatcher.register(store.handleActions.bind(store))
export default store
