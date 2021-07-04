import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class RoleStore extends StoreHelper {

  constructor() {
    super({
      resourceName: 'ROLE'
    })

    this['CREATED_ROLE'] = (action) => {
      this.resources = this.resources || []
      this.resources.push(action.resource)
      this.emit('change')
      this.emit('save')
    }
  }

}

const store = new RoleStore
Dispatcher.register(store.handleActions.bind(store))
export default store
