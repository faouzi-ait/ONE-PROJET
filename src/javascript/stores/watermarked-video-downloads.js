import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class WatermarkedVideoDownloadsStore extends StoreHelper {
  constructor() {
    super({ resourceName: 'WATERMARKED_VIDEO_DOWNLOADS' })
  }
}

const store = new WatermarkedVideoDownloadsStore
Dispatcher.register(store.handleActions.bind(store))
export default store