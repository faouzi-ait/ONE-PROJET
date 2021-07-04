import devConfig from 'javascript/config/development'

import { AUTH_TOKEN, IMPERSONATED_AUTH_TOKEN } from 'javascript/utils/constants'
import { clientName, isLiteClient } from 'javascript/utils/theme/liteClientName'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'

const customApiConfig = {
  production: {
    url: {
    },
    key: {
      /*
        DO NOT EDIT THIS...
        we should never have api keys saved here..
        they should all exist within environment variables
      */
    }
  },
  staging: {
    url: {
    },
    key: {
      ae: 'aenetworks-web',
    },
  }
}

const createApiInfo = {
  key: (client, environment) => {
    if (process.env.TARGET_ENV === 'development' && devConfig.apiKey) return devConfig.apiKey
    if (isLiteClient()) {
      const liteClient = clientName().toUpperCase()
      if(process.env[`${liteClient}_API_KEY`]){
        return process.env[`${liteClient}_API_KEY`]
      }
    }
    if (process.env.API_KEY && process.env.TARGET_ENV === 'production') return process.env.API_KEY
    const customApiKey = customApiConfig[environment].key[client]
    if (customApiKey) return customApiKey
    return `${clientName()}-web`
  },
  url: (client, environment) => {
    if (process.env.TARGET_ENV === 'development' && devConfig.apiUrl) return devConfig.apiUrl
    if (process.env.API_URL && process.env.TARGET_ENV === 'production') return process.env.API_URL
    const customApiUrl = customApiConfig[environment].url[client]
    if (customApiUrl) return customApiUrl
    const branch = environment === 'production' ? '' : '.staging'
    if (isLiteClient()) {
      return `https://api-lite${branch}.rawnet.one`
    }
    return `https://api-${client}${branch}.rawnet.one`
  }
}

const environment = process.env.TARGET_ENV === 'production' ? 'production' : 'staging'
const client = process.env.CLIENT

const apiUrl = createApiInfo.url(client, environment)
const devDummyServer = process.env.TARGET_ENV === 'development' && devConfig.dummyApi
const apiConfig = {
  apiUrl: devDummyServer ? 'http://localhost:3003' : apiUrl,
  trailingSlash: {
    duplicate: true
  },
  headers: {
    'API-Version': 1,
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
    'X-Web-Api-Key': createApiInfo.key(client, environment)
  },
  googleMapsApi: process.env.GOOGLE_MAPS_API || 'AIzaSyCW_fp0edOlC8_5T-IlXMaDxn31vVKyJF8'
}

if (devDummyServer) {
  apiConfig.headers.devApiUrl = apiUrl
}

export const injectApiAuthHeaders = (headers = {}) => {
  const authToken = safeLocalStorage.getItem(AUTH_TOKEN)
  const impersonatedAuthToken = safeLocalStorage.getItem(IMPERSONATED_AUTH_TOKEN)
  if (authToken) {
    headers['Authorization'] = 'Bearer ' + authToken
    if (impersonatedAuthToken) {
      headers['X-Impersonated'] = 'Bearer ' + impersonatedAuthToken
    } else {
      delete headers['X-Impersonated']
    }
  } else {
    delete headers['Authorization']
    delete headers['X-Impersonated']
  }
  return headers
}

export default apiConfig