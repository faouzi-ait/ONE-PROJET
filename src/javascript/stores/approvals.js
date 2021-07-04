import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class ApprovalsStore extends StoreHelper {
  constructor() {
    super({
      resourceName: 'APPROVAL'
    })
  }

  UPDATED_APPROVAL = () => {
    this.emit('save')
  }
}

const store = new ApprovalsStore
Dispatcher.register(store.handleActions.bind(store))
export default store