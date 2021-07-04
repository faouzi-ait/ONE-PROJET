import axios from 'axios'
import { injectApiAuthHeaders } from 'javascript/config'

import EventEmitter from 'javascript/utils/event-emitter'

/** Hack to make it work in Safari, thanks StackOverflow */
class Emitter {
  constructor() {
    const delegate = document.createDocumentFragment()
    const methods = ['addEventListener', 'dispatchEvent', 'removeEventListener']
    methods.forEach(f => (this[f] = (...xs) => delegate[f](...xs)))
  }
}

/** 401 Error Event Emitter */
export const unauthorisedErrorEmitter = new Emitter()
export const subscribeToUnauthorisedErrorEmitter = listener =>
  unauthorisedErrorEmitter.addEventListener('custom-error', listener)
export const unsubscribeToUnauthorisedErrorEmitter = listener =>
  unauthorisedErrorEmitter.removeEventListener('custom-error', listener)

export const reportUnauthorisedError = payload => {
  if (window.location.pathname !== '/login') {
    const event = new CustomEvent('custom-error', {
      detail: {
        path: window.location.pathname,
        requestUrl: payload.config.url,
      },
    })
    unauthorisedErrorEmitter.dispatchEvent(event)
  }
}

const maintenanceErrorEmitter = new EventEmitter()
export const subscribeToMaintenanceErrorEmitter = (listener) => {
  maintenanceErrorEmitter.addEventListener('503-status', listener)
}
export const unsubscribeToMaintenanceErrorEmitter = (listener) => {
  maintenanceErrorEmitter.removeEventListener('503-status', listener)
}


let errorMiddleware = {
  name: 'middleware-replaced-error',
  error: function (payload) {
    if (typeof payload.data === 'string') {
      return [payload.data]
    } else {
      const errors = {}
      if (payload.data.errors) {
        payload.data.errors.forEach((error) => {
          if (error.source?.pointer) {
            errors[error.source.pointer.split('/').pop()] = error.title
          } else if (error.detail) {
            errors.detail = error['detail']
          }
        })
        console.error(errors)
        return errors
      }
    }
  }
}

const insertApiMiddleware = api => {
  api.insertMiddlewareBefore('axios-request', {
    name: 'set-auth-token',
    req: payload => {
      api.headers = injectApiAuthHeaders(api.headers)
      payload.req.headers = injectApiAuthHeaders(payload.req.headers)
      return payload
    },
  })
  /**
   * This adds 'programme-slug' by default
   * to all programme get requests
   */
  api.insertMiddlewareBefore('axios-request', {
    name: 'get-programme-slug',
    req: payload => {
      const shouldAddSlug = (payload?.req?.params?.fields?.programmes)
      if (shouldAddSlug) {
        payload.req.params.fields.programmes += ',slug'
      }
      return payload
    },
  })
  /**
   * This allows you to add
   * headers as a key in 'params', and pass
   * them to the headers in the app
   */
  api.insertMiddlewareBefore('axios-request', {
    name: 'extract-headers-from-params',
    req: payload => {
      payload.req.headers = {
        ...payload.req.headers,
        ...((payload.req.params || {}).headers || {}),
      }
      delete (payload.req.params || {}).headers
      return payload
    },
  })
  api.insertMiddlewareBefore('errors', {
    name: 'check-for-401',
    error: payload => {
      /**
       * If the dev has passed in LOGIN_REDIRECT_OVERRIDE_KEY
       * in the headers, ignore 401 redirect
       */
      if (payload.config?.headers[LOGIN_REDIRECT_OVERRIDE_KEY]) {
        return payload
      }
      if (payload.status && (Number(payload.status) === 401)) {
        if (payload.config.params?.['virtual-meeting-token'] && window.location.search?.includes('virtual-meeting-token')) {
          return /* users with a virtual-meeting-token do not need all fetched resources.. ignore login redirect */
        }
        reportUnauthorisedError(payload)
      }
      return payload
    },
  })
  api.insertMiddlewareBefore('errors', {
    name: 'check-for-503',
    error: payload => {
      if (payload.status && (Number(payload.status) === 503)) {
        const event = new CustomEvent('503-status')
        maintenanceErrorEmitter.emit(event)
      }
      return payload
    },
  })
  /**
   * This handles all the GET requests before POST/DELETE to /relationships/ endpoints
   * Current JSON:Api implementation will fail all if one of the links already exists
   * uses a GET to verify which resources are available to create or delete.
   */
  api.insertMiddlewareBefore('axios-request', {
    name: 'verify-relationships-exist',
    req: payload => {
      if (payload.req.url.includes('/relationships/')) {
        return new Promise((resolve, reject) => {
          axios({
            url: payload.req.url,
            method: 'GET',
            headers: payload.req.headers
          })
          .then((response) => {
            const existingRelationshipIdCache = response.data.data.reduce((cache, curr) => {
              cache[curr.id] = curr.id
              return cache
            }, {})
            if (payload.req.method === 'POST') {
              payload.req.data.data = payload.req.data.data.reduce((acc, r) => {
                if (!existingRelationshipIdCache[r.id]) {
                  acc.push({ id: r.id, type: r.type })
                }
                return acc
              }, [])
            } else if (payload.req.method === 'DELETE') {
              payload.req.data = { data: [] }
              payload.req.data.data = payload.req.deletePayload.reduce((acc, r) => {
                if (existingRelationshipIdCache[r.id]) {
                  acc.push({ id: r.id, type: r.type })
                }
                return acc
              }, [])
            }
            return resolve(payload)
          })
          .catch((error) => {
            return reject({ text: 'JSON:API middleware for /relationships/ GET', error })
          })
        })
      }
      return payload
    },
  })
  api.replaceMiddleware('errors', errorMiddleware)
}

export const LOGIN_REDIRECT_OVERRIDE_KEY = 'login-redirect-override-key'

export default insertApiMiddleware
