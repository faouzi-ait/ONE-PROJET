import Dispatcher from 'javascript/dispatcher'
import API from 'javascript/services/users'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class UserApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'USER'
  }
  error(errors) {
    Dispatcher.dispatch({
      type: `USER_EDIT_ERROR`,
      errors: errors
    })
  }
  receiveClients(resources) {
    Dispatcher.dispatch({
      type: 'RECEIVED_CLIENTS',
      resources: resources
    })
  }
  receiveAccountManagers(resources) {
    Dispatcher.dispatch({
      type: 'RECEIVED_ACCOUNT_MANAGERS',
      resources: resources
    })
  }
  receiveSalesCoordinators(resources) {
    Dispatcher.dispatch({
      type: 'RECEIVED_SALES_COORDINATORS',
      resources: resources
    })
  }
  userCreated(resource) {
    Dispatcher.dispatch({
      type: 'CREATED_NEW_USER',
      resource: resource
    })
  }
  userDuplicated(resource) {
    Dispatcher.dispatch({
      type: 'DUPLICATED_USER',
      resource: resource
    })
  }
  userUpdated(resource) {
    Dispatcher.dispatch({
      type: 'SAVED_USER',
      resource: resource
    })
  }
  userSuspended(resource) {
    Dispatcher.dispatch({
      type: 'USER_SUSPENDED',
      resource
    })
  }
  resourceExported() {
    Dispatcher.dispatch({
      type: 'USER_EXPORTED'
    })
  }
}

API.actions = new UserApiActions

class UserViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'USER'
    this.API = API
  }
  getClients(query) {
    this.API.getClients(query)
  }
  getAccountManagers(query = {}) {
    if(!query['filter']) { query['filter'] = {} }
    query['filter']['choices-for'] = 'user-account-manager'
    this.API.getAccountManagers(query)
  }
  getSalesCoordinators(query) {
    if(!query['filter']) { query['filter'] = {} }
    query['filter']['choices-for'] = 'user-sales-coordinators'
    this.API.getSalesCoordinators(query)
  }
  createUser(resource) {
    this.API.createUser(resource)
  }
  duplicateUser(resource) {
    this.API.duplicateUser(resource)
  }
  updateUser(resource) {
    this.API.updateUser(resource)
  }
  suspendUser(id, suspended) {
    this.API.suspendUser(id, suspended)
  }
  exportCSV(query){
    this.API.exportCSV(query)
  }
}

const actions = new UserViewActions
export default actions
