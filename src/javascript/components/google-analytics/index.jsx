import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactGA from 'react-ga'
import { useLocation } from 'react-router-dom'

import withHooks from 'javascript/utils/hoc/with-hooks'

class GoogleAnalytics extends Component {
  componentDidMount () {
    this.logPageChange(
      this.props.location.pathname,
      this.props.location.search
    )
  }

  componentDidUpdate ({ location: prevLocation }) {
    const { location: { pathname, search } } = this.props
    const isDifferentPathname = pathname !== prevLocation.pathname
    const isDifferentSearch = search !== prevLocation.search

    if (isDifferentPathname || isDifferentSearch) {
      this.logPageChange(pathname, search)
    }
  }

  logPageChange (pathname, search = '') {
    let intervalCount = 0 //ensure we don't loop forever!
    const interval = setInterval(() => {
      intervalCount++
      const page = pathname + search
      const { location, document } = window
      if(document.title.length > 0 || intervalCount > 40){
        clearInterval(interval)
        ReactGA.set({
          page,
          title: document.title,
          location: `${location.origin}${page}`,
          ...this.props.options,
        })
        ReactGA.pageview(page, [], document.title)
      }
    }, 500) //needs to wait for page to load to get document.title
  }

  render () {
    return null
  }
}

const userAnalyticsOptions = (user, googleAnalyticsCV) => {
  let userOptions = {}
  if (user) {
    userOptions = {
      userId: user.id,
      ...googleAnalyticsCV.userDimensions(user)
    }
  }
  return userOptions
}

GoogleAnalytics.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string
  }).isRequired,
  options: PropTypes.object
}

const RouteTracker = (injectedProps) => {
  const location = useLocation()
  return <GoogleAnalytics location={location} {...injectedProps} />
}

const init = (analyticsId, options = {}) => {
  const trackGoogleAnalytics = analyticsId
  && process.env.TARGET_ENV !== 'development'
  if (trackGoogleAnalytics) {
    ReactGA.initialize(analyticsId, {
      ...options,
      gaOptions: {
        siteSpeedSampleRate: 100
      }
    })
  }
  return trackGoogleAnalytics
}

export default {
  GoogleAnalytics,
  RouteTracker,
  init,
  userAnalyticsOptions
}