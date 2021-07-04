import React from 'react'

import { Redirect, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'

import NotFound from 'javascript/components/not-found'
import { hasAdminPanelAccess, checkPermissions, checkFEPermissions } from 'javascript/services/user-permissions'
import UserStore from 'javascript/stores/user'

import { isClient } from 'javascript/utils/client-switch/tools'

const AuthComponent = (props) => {

  const { component: Component , routeConfig, user, admin } = props
  if (admin) {
    if (!hasAdminPanelAccess(user) || (!checkPermissions(user, routeConfig) && routeConfig.path !== '/admin')) {
      return <NotFound />
    }

  } else {
    if (user && !checkFEPermissions(user, routeConfig)) { // Logged in User Persmissions?
      return <NotFound />
    }
    if (routeConfig.user && !UserStore.authenticated()) { // Private Route
      const state = {
        nextPathname: location.pathname + location.search,
        notification: {
          message: 'You have to be logged in to see that',
          type: 'error'
        }
      }
      return  <Redirect to={{...location, state, pathname: `/${props.theme.variables.SystemPages.login.path}` }} />
    }
  }
  return (
    <Component {...props} user={user} isClient={isClient} />
  )
}

const enhance = compose(
  withRouter,
  withTheme,
)
export default enhance(AuthComponent)

// Prop Types
AuthComponent.propTypes = {
  routeConfig: PropTypes.object.isRequired,
  component: PropTypes.elementType.isRequired,
  user: PropTypes.object, // signed in user object || null
}
