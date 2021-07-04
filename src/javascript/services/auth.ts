import axios from 'devour-client/node_modules/axios'
import deepmerge from 'deepmerge-concat'
import JsonApi from 'devour-client'
import jwtDecode from 'jwt-decode'
import moment from 'moment'

import apiConfig from 'javascript/config'
import * as Actions from 'javascript/actions/user'
import modelData from 'javascript/models'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { AUTH_TOKEN, IMPERSONATED_AUTH_TOKEN } from 'javascript/utils/constants'

import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { PasswordType } from 'javascript/types/ModelTypes'

const jsonApi = new JsonApi(apiConfig)
jsonApi.headers = Object.assign(apiConfig.headers, jsonApi.headers)

jsonApi.define('user', modelData.users)
jsonApi.define('role', modelData.roles)
jsonApi.define('account-manager', modelData.accountManager)
jsonApi.define('company', modelData.companies)
jsonApi.define('password', modelData.password)
jsonApi.define('territory', modelData.territories)
jsonApi.define('genre', modelData.genres)
jsonApi.define('programme-type', modelData.programmeTypes)
jsonApi.define('region', modelData.regions)

jsonApi.replaceMiddleware('errors', {
  name: 'errors',
  error: function(payload) {
    return payload.data.errors
  },
})

export function authenticateUser(user: { email: string; password: string }, theme: ThemeType, gRecaptchaResponse: string) {
  return axios({
    url: `${apiConfig.apiUrl}/user-token`,
    method: 'POST',
    headers: apiConfig.headers,
    data: {
      auth: {
        email: user.email,
        password: user.password,
      },
      ...(gRecaptchaResponse && {data: {attributes: {'g-recaptcha-response': gRecaptchaResponse}}}),
    },
  })
    .then(response => {
      Actions.userAuthenticated(response.data.jwt, theme)
    })
    .catch((error) => {
      if (error.status === 404) {
        Actions.authenticationFailed(
          'Email / password combination was incorrect',
        )
      } else if (error.status === 429) {
        Actions.authenticationFailed(
          'Too many incorrect attempts. Please wait a few minutes',
        )
      } else if (error.status === 401 && containsGoogleRecaptchaError(error)) {
        Actions.authenticationFailed(GOOGLE_RECAPTCHA_ERROR_TXT)
      }
    })
}

export const GOOGLE_RECAPTCHA_ERROR_TXT = 'Please complete identity check (CAPTCHA)'
const containsGoogleRecaptchaError = (error) => {
  // @ts-ignore
  return !!error.data.errors.filter(err => Object.values(err).filter(msg => msg.includes('g-recaptcha')).length).length
}

const validateToken = (token, needsRefreshing = false) => new Promise<{
  token: string | null
  error: { msg: string, error: any } | null
}>((resolve) => {
  const headers = {
    ...apiConfig.headers,
    Authorization: 'Bearer ' + token,
  }
  axios({
    url: apiConfig.apiUrl + '/user-token',
    method: needsRefreshing ? 'PATCH' : 'GET',
    headers: headers,
  })
    .then((response) => {
      if (needsRefreshing) {
        safeLocalStorage.setItemWithExpiration('AUTH_TOKEN_REFRESHED', true, 720)
      }
      resolve({ error: null, token: needsRefreshing ? response.data.jwt : token })
    })
    .catch((error) => {
      resolve({ error: { msg: 'token validation failed', error }, token: null })
    })
})

export function restoreSession(authToken, theme: ThemeType) {
  return new Promise( async(resolve, reject) => {
    try {
      const impersonatedAuthToken = safeLocalStorage.getItem(IMPERSONATED_AUTH_TOKEN)
      const today = moment()
      const expiryDate = moment.unix(jwtDecode(authToken).expir || 0)
      const tokenNeedsRefreshing = today.isBefore(expiryDate) && !safeLocalStorage.getItemWithExpiration('AUTH_TOKEN_REFRESHED')
      const validation = await validateToken(authToken, tokenNeedsRefreshing)
      if (validation.error) {
        if (impersonatedAuthToken) {
          // stop impersonation and attempt to login again..
          safeLocalStorage.removeItem(IMPERSONATED_AUTH_TOKEN)
          return window.location.reload()
        } else {
          await Actions.clearSession()
          return reject(validation.error)
        }
      } else {
        const session = sessionStorage.getItem(AUTH_TOKEN)
        if (theme?.variables?.KidsVersion || !session || tokenNeedsRefreshing) {
          safeLocalStorage.setItem(AUTH_TOKEN, validation.token)
        }
      }
      const activeAuthToken = impersonatedAuthToken || validation.token
      Actions.sessionRestored(activeAuthToken)
      resolve('token validated and refreshed')
    } catch (error) {
      Actions.clearSession().finally(() => {
        return reject({ error })
      })
    }
  })
}

export function logoutUser() {
  return axios({
    url: `${apiConfig.apiUrl}/user-token`,
    method: 'DELETE',
    headers: apiConfig.headers,
  })
}


export function getUser(userId, theme: ThemeType) {
  let userQuery = {
    include: 'roles,company',
    fields: {
      users: [
        'title', 'first-name', 'last-name', 'email', 'roles', 'user-type',
        'job-title', 'telephone-number', 'company', 'mobile-number',
        'mobile-country-code', 'has-production-companies'
      ].join(','),
      roles: 'name,permissions',
      genres: 'name',
    },
  }

  /* #region  cineflix | itv  */
  userQuery = deepmerge.concat(userQuery, {
    fields: {
      users: 'buyer-type',
    },
  })
  /* #endregion */

  if (theme.features.accountManager) {
    userQuery = deepmerge.concat(userQuery, {
      include: 'account-manager',
      fields: {
        users: 'account-manager',
      },
    })
  }

  if (theme.features.territories.enabled || theme.features.territories.cms) {
    userQuery = deepmerge.concat(userQuery, {
      include: 'territories',
      fields: {
        users: 'territories',
        territories: 'name',
      },
    })
  }

  if (theme.features.regions.enabled) {
    userQuery = deepmerge.concat(userQuery, {
      include: 'regions',
      fields: {
        users: 'regions',
        regions: 'name',
      },
    })
  }

  if (theme.features.users.genres) {
    userQuery = deepmerge.concat(userQuery, {
      include: 'genres',
      fields: {
        users: 'genres',
        genres: 'name',
      },
    })
  }

  if (theme.features.users.marketing?.enabled) {
    userQuery = deepmerge.concat(userQuery, {
      fields: {
        users: 'marketing',
      },
    })
  }

  if (theme.features.programmeTypes.preferences) {
    userQuery = deepmerge.concat(userQuery, {
      include: 'programme-types',
      fields: {
        users: 'programme-types',
        'programme-types': 'name'
      },
    })
  }

  if (theme.features.users.limitedAccess) {
    userQuery = deepmerge.concat(userQuery, {
      fields: {
        users: 'limited-access',
      },
    })
  }
  jsonApi.find('user', userId, userQuery).then(response => {
    Actions.gotUser(response)
  })
}

export function requestPasswordReset(resource: { email: string, gRecaptchaResponse: string }) {
  let url = `${apiConfig.apiUrl}/passwords/new?data[type]=passwords&data[attributes][email]=${encodeURIComponent(resource.email)}`
  if (resource.gRecaptchaResponse) {
    url += `&data[attributes][g-recaptcha-response]=${resource.gRecaptchaResponse}`
  }
  axios({
    url,
    method: 'GET',
    headers: apiConfig.headers,
  })
    .then(Actions.passwordResetRequested)
    .catch(error => {
      if (containsGoogleRecaptchaError(error)) {
        Actions.passwordError(GOOGLE_RECAPTCHA_ERROR_TXT)
      } else {
        Actions.passwordError(error.data.message)
      }
    })
}

export function resetPassword(resource: PasswordType) {
  jsonApi
    .update('password', resource)
    .then(Actions.passwordReset)
    .catch(Actions.passwordError)
}