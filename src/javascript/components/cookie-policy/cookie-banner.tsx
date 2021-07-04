import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'

import 'stylesheets/core/components/cookie-policy'

import Button from 'javascript/components/button'
import NavLink from 'javascript/components/nav-link'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { clientName } from 'javascript/utils/theme/liteClientName'
import useTheme from 'javascript/utils/theme/useTheme'
import { useReduxThemeState } from 'javascript/utils/theme/ThemeProvider'

const CookieBanner = ({
  location
}) => {

  const theme = useTheme()
  const themeState = useReduxThemeState()

  const cookiePolicy = cookiePolicyHandler.get()
  const cookiePolicyAccepted = Boolean(cookiePolicy?.accepted)
  const [displayBanner, setDisplayBanner] = useState(false)

  useEffect(() => {
    let showCookieBanner = !cookiePolicyAccepted
    if (location.pathname === '/cookie-policy') {
      setDisplayBanner(false)
      showCookieBanner = false
    }
    if (showCookieBanner) {
      setTimeout(() => setDisplayBanner(true), 1500)
    }
  }, [location])

  const acceptAllCookies = () => {
    cookiePolicyHandler.set({
      accepted: true,
      analytics: true,
    })
    setDisplayBanner(false)
    themeState.setTheme(theme) // resetting theme to force layouts/application to re-render
  }

  const bannerClasses = ['cookie-policy__banner', displayBanner && 'displayed'].filter(Boolean).join(' cookie-policy__banner--')
  if (!cookiePolicyAccepted) {
    return (
      <div className={bannerClasses}>
        <h2>
          We use cookies to offer you the best experience.
        </h2>
        <div>
          By using our website or clicking 'Accept all cookies', you are agreeing to our
          <NavLink to="/cookie-policy" className="cookie-policy__banner-link">cookie policy</NavLink>.
          You can also manage your personal cookie preferences.
        </div>
        <Button type="button"
          className="button button--filled"
          style={{ marginTop: '20px'}}
          onClick={acceptAllCookies}
        >
          Accept all cookies
        </Button>
        <ClientSpecific client="ae">
          <NavLink to="/cookie-policy" 
            className="button button--small">
            Cookie settings</NavLink>
        </ClientSpecific>
      </div>
    )
  }
  return null
}

const defaultCookiePolicy = {
  accepted: false,
  analytics: false
}

export const cookiePolicyHandler = (() => {
  const cookieName = `${clientName()}-cookie-policy`
  const get = () => JSON.parse(safeLocalStorage.getItem(cookieName)) || defaultCookiePolicy
  const set = (cookiePolicy) => safeLocalStorage.setItem(cookieName, JSON.stringify(cookiePolicy))
  const analyticsAllowed = () => get().analytics
  return {
    get,
    set,
    analyticsAllowed
  }
})()

export default withRouter(CookieBanner)