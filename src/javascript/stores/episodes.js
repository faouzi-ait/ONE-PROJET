import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class EpisodeStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'EPISODE'
    })
  }

}

const store = new EpisodeStore
Dispatcher.register(store.handleActions.bind(store))
export default store
