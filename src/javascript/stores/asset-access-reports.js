import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class AssetsAccessReportsStore extends StoreHelper {
  constructor() {
    super({ resourceName: 'ASSET_ACCESS_REPORTS' })
  }

  RECEIVED_ASSET_ACCESS_REPORTS = (action) => {
    this.resources = action.resources
    this.emit('change')
  }
}

const store = new AssetsAccessReportsStore
Dispatcher.register(store.handleActions.bind(store))
export default store