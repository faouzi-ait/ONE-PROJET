import Dispatcher from 'javascript/dispatcher'
import * as API from 'javascript/services/auth'
import Analytics from 'javascript/actions/analytics'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { AUTH_TOKEN, IMPERSONATED_AUTH_TOKEN } from 'javascript/utils/constants'

export function authenticateUser(user, theme, gRecaptchaResponse) {
  API.authenticateUser(user, theme, gRecaptchaResponse)
}

export function getUser(userId, theme) {
  API.getUser(userId, theme)
}

export function gotUser(user) {
  Dispatcher.dispatch({
    type: 'RECEIVED_AUTHENTICATED_USER',
    user: user
  })
}

export function requestPasswordReset(resource) {
  API.requestPasswordReset(resource)
}

export function passwordResetRequested() {
  Dispatcher.dispatch({
    type: 'PASSWORD_RESET_REQUESTED'
  })
}

export function resetPassword(resource) {
  API.resetPassword(resource)
}

export function passwordReset() {
  Dispatcher.dispatch({
    type: 'PASSWORD_RESET'
  })
}

export function passwordError(error) {
  Dispatcher.dispatch({
    type: 'PASSWORD_ERROR',
    error: error
  })
}

export function userAuthenticated(token, theme) {
  if(theme?.variables?.KidsVersion){
    document.cookie = `${AUTH_TOKEN}=${token};path=/;domain=${window.location.host.replace('kids.', '')}`
  }
  safeLocalStorage.setItem(AUTH_TOKEN, token)
  sessionStorage.setItem(AUTH_TOKEN, token)
  Analytics.recordLogin()
  Dispatcher.dispatch({
    type: 'USER_AUTHENTICATED',
    token: token
  })
}

export function restoreSession(authToken, theme) {
  return API.restoreSession(authToken, theme)
}

export function sessionRestored(activeToken) {
  const session = sessionStorage.getItem(AUTH_TOKEN)
  if (!session) {
    Analytics.recordLogin()
  }
  Dispatcher.dispatch({
    type: 'USER_AUTHENTICATED',
    token: activeToken
  })
}

export function clearSession(theme) {
  safeLocalStorage.removeItem(AUTH_TOKEN)
  safeLocalStorage.removeItem(IMPERSONATED_AUTH_TOKEN)
  sessionStorage.removeItem(AUTH_TOKEN)
  return API.logoutUser().finally(() => {
    if(theme?.variables?.KidsVersion){
      document.cookie = `${AUTH_TOKEN}=;path=/;domain=${window.location.host.replace('kids.', '')}`
    }
    Dispatcher.dispatch({ type: 'LOGOUT_USER' })
  })
}

export function authenticationFailed(error) {
  Dispatcher.dispatch({
    type: 'AUTHENTICATION_FAILED',
    error: error
  })
}