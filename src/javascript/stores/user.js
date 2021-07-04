import { EventEmitter } from 'events'
import Dispatcher from 'javascript/dispatcher'

class UserStore extends EventEmitter {

  constructor(props) {
    super()
    this.token = null
    this.error = null
    this.errors = []
    this.user = null
    this.logoutRedirectUrl = null
  }

  authenticated() {
    return !!this.user
  }

  getToken() {
    return this.token
  }

  getError() {
    return this.error
  }

  getErrors() {
    return this.errors
  }

  getUser() {
    return this.user
  }

  getLogoutRedirectUrl() {
    return this.logoutRedirectUrl
  }

  handleActions(action) {
    switch(action.type) {
      case 'PASSWORD_ERROR': {
        this.error = action.error
        this.emit('error')
        break
      }
      case 'AUTHENTICATION_FAILED': {
        this.error = action.error
        this.emit('error')
        break
      }
      case 'USER_AUTHENTICATED': {
        this.token = action.token
        this.emit('authenticated')
        break
      }
      case 'RECEIVED_AUTHENTICATED_USER': {
        this.user = action.user
        this.emit('change')
        break
      }
      case 'LOGOUT_USER': {
        this.token = null
        this.user = null
        this.logoutRedirectUrl = action.payload
        this.emit('change')
        break
      }
      case 'PASSWORD_RESET_REQUESTED': {
        this.emit('resetRequested')
        break
      }
      case 'PASSWORD_RESET': {
        this.emit('passwordReset')
        break
      }
    }
  }

}

const store = new UserStore
Dispatcher.register(store.handleActions.bind(store))
export default store