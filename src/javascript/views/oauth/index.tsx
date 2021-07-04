import React, { useEffect, useState } from 'react'
import axios from 'axios'
import queryString from 'query-string'
import styled from 'styled-components'

import apiConfig from 'javascript/config'
import { userAuthenticated } from 'javascript/actions/user'

import { OAUTH_REDIRECT_ROUTE } from 'javascript/utils/constants'
import { RouteComponentProps } from 'react-router'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface MatchParams {
  providerName: string
}

interface Props extends RouteComponentProps<MatchParams> {
  theme: ThemeType
}

const OAuthRedirect: React.FC<Props> = ({
  history,
  location,
  match,
  theme,
}) => {
  const redirectRoutes = safeLocalStorage.getItemWithExpiration(OAUTH_REDIRECT_ROUTE)
  const parsedQS = queryString.parse(location.search)
  const { error, code, state } = parsedQS
  const redirectRoute = redirectRoutes ? redirectRoutes[state as string] : '/'
  const [displayError, setDisplayError] = useState(false)

  useEffect(() => {
    if (code) {
      axios({
        url: `${apiConfig.apiUrl}/oauth/${match.params.providerName}`,
        method: 'POST',
        headers: {
          'X-Web-Api-Key': apiConfig.headers['X-Web-Api-Key'],
          'Content-Type': 'application/json'
        },
        data: { code, state }
      })
      .then((response) => {
        userAuthenticated(response.data.jwt, theme)
        if (response.data.request_additional_details) {
          const path = '/'
          setTimeout(() => {
            history.push({
              pathname: path,
              state: { requestAdditionalDetails: true },
            })
          }, 200) //timeout is required. Need to ensure history.push is added to back of event loop else state does not exist on redirect
        } else {
          history.push(redirectRoute)
        }
      })
      .catch((error) => {
        console.error('OAuthValidation -> error: ', error)
        history.push('/')
      })
    } else if (error) {
      setDisplayError(true)
      setTimeout(() => {
        history.push('/')
      }, 3000)
    }

  }, [])
  let errorWarning = `Error logging in via ${match.params.providerName}`
  if (error && parsedQS['error_description']) { //@ts-ignore
    errorWarning += '. ' + parsedQS['error_description'].replace('+', ' ')
  } else {
    errorWarning += ', please try again.'
  }

  return (
    <div className="container">
      {displayError ?  (
        <ErrorWarning className="wysiwyg">
          <h3>{ errorWarning }</h3>
        </ErrorWarning>
        ) : (
        <div className="loader"></div>
      )}
    </div>
  )
}

export default OAuthRedirect


const ErrorWarning = styled.div`
  position: absolute;
  width: 400px;
  top: 40%;
  left: calc(50% - 200px);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`