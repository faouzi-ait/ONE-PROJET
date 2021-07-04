import StoreHelper from 'javascript/stores/helper'
import Dispatcher from 'javascript/dispatcher'

class UsersStore extends StoreHelper {

  constructor(props) {
    super({
      resourceName: 'USER'
    })
    this.clients = null
    this.accountManagers = null
    this.salesCoordinators = null
  }

  USER_EDIT_ERROR = (action) => {
    this.errors = action.errors
    this.emit('error')
  }

  RECEIVED_CLIENTS = (action) => {
    this.clients = action.resources
    this.emit('receivedClients')
  }

  RECEIVED_ACCOUNT_MANAGERS = (action) => {
    this.accountManagers = action.resources
    this.emit('receivedAccountManagers')
  }

  RECEIVED_SALES_COORDINATORS = (action) => {
    this.salesCoordinators = action.resources
    this.emit('receivedSalesCoordinators')
  }

  SAVED_USER = (action) => {
    this.resource = action.resource
    this.emit('save')
  }

  CREATED_NEW_USER = (action) => {
    this.resource = action.resource.id
    this.emit('save')
  }

  DUPLICATED_USER = (action) => {
    this.emit('duplicate')
  }

  USER_SUSPENDED = (action) => {
    this.resources = this.resources.map(r => {
      if (r.id === action.resource.id) {
        return {
          ...r,
          suspended: action.resource.suspended
        }
      }
      return r
    })
    this.emit('change')
  }

  DELETED_USER = (action) => {
    if(this.resources){
      const resources = this.resources.filter(({id}) => id !== action.resource.id)
      resources.links = this.resources.links || {}
      resources.meta = this.resources.meta || {}
      this.resources = resources
    }
    this.emit('change')
    this.emit('delete')
  }

  getClients() {
    return this.clients
  }

  getAccountManagers() {
    return this.accountManagers
  }

  getSalesCoordinators() {
    return this.salesCoordinators
  }
  
  USER_EXPORTED = () => {
    this.emit('exported')
  }

}

const store = new UsersStore
Dispatcher.register(store.handleActions.bind(store))
export default store


