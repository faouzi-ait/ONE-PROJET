import React from 'react'
import axios from 'axios'
import { NavLink } from 'react-router-dom'
import queryString from 'query-string'

import { OAUTH_REDIRECT_ROUTE } from 'javascript/utils/constants'

import allClientVariables from './variables'
import apiConfig from 'javascript/config'
import loginClientVariables from 'javascript/views/sessions/new/variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useTheme from 'javascript/utils/theme/useTheme'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'

interface Props {
  loading: boolean
}

export const hasEnabledOAuthProvider = (providers) => {
  let hasOAuthProvider = false
  Object.keys(providers).forEach((providerName) => {
    if (hasOAuthProvider) return
    hasOAuthProvider = providers[providerName].enabled
  })
  return hasOAuthProvider
}

const OAuthLoginButtons: React.FC<Props> = ({
  loading
}) => {
  const { features, variables } = useTheme()
  const { prefix } = usePrefix()

  const loginCV = useClientVariables(loginClientVariables)
  const oAuthCV = useClientVariables(allClientVariables, {
    buttonClasses: {
      default: `${prefix}button`,
      'ae': `${prefix}button ${prefix}button--secondary ${prefix}button--with-icon ${prefix}button--okta`
    }
  })

  const hasOAuthLogins = features.oauth.enabled && hasEnabledOAuthProvider(features.oauth.providers)

  const submitOAuthLogin = (providerName) => {
    axios({
      url: `${apiConfig.apiUrl}/oauth/${providerName}`,
      method: 'GET',
      headers: {
        ...apiConfig.headers,
      },
    })
    .then((response) => {
      const authorizeUrl = response.data['authorize_url']
      const redirectRoutes = safeLocalStorage.getItemWithExpiration(OAUTH_REDIRECT_ROUTE) || {}
      const { state } = queryString.parse(authorizeUrl)
      redirectRoutes[state as string] = window.location.pathname
      safeLocalStorage.setItemWithExpiration(OAUTH_REDIRECT_ROUTE, redirectRoutes, 10)
      window.location.replace(authorizeUrl)
    })
    .catch((error) => {
      console.error('submitOAuthLogin -> error: ', error)
    })
  }

  return (
    <>
      { hasOAuthLogins && Object.keys(features.oauth.providers).map((providerName) => {
        const provider = features.oauth.providers[providerName]
        return provider.enabled ? (
          <div key={providerName}>
            <div className={`${prefix}form__control ${prefix}form__control--actions`}>
              <button type="button" className={oAuthCV.buttonClasses} onClick={(e) => submitOAuthLogin(providerName)}>
                {oAuthCV.oAuthButtonTitles[providerName] || `Login with ${providerName}`}
              </button>
            </div>
            { provider.forgotPasswordUrl && (
              <div className="u-center-content">
                <a href={provider.forgotPasswordUrl} target="_blank" className={loginCV.forgotPasswordButtonClasses}>
                  {loginCV.forgottenPasswordText(variables.SystemPages.forgottenPassword.upper)}
                </a>
                { features.users.registrations.enabled &&
                  <NavLink to="/register" className={loginCV.registerButtonClasses}>
                    {loginCV.registerText}
                  </NavLink>
                }
              </div>
            )}
          </div>
        ) : null
      })}
    </>
  )
}

export default OAuthLoginButtons
