import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class PrivateVideoViewsStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'PRIVATE_VIDEO_VIEW'
    })
  }

}

const store = new PrivateVideoViewsStore
Dispatcher.register(store.handleActions.bind(store))
export default store
