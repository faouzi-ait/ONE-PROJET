import Dispatcher from 'javascript/dispatcher'

export function apiError(message) {
  Dispatcher.dispatch({
    type: 'API_ERROR',
    message: message
  })
}