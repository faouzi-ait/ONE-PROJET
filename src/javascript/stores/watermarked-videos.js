import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class WatermarkedVideosStore extends StoreHelper {
  constructor() {
    super({ resourceName: 'WATERMARKED_VIDEOS' })
  }
}

const store = new WatermarkedVideosStore
Dispatcher.register(store.handleActions.bind(store))
export default store