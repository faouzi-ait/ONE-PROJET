// React
import React, { Suspense } from 'react'
import Intercom from 'react-intercom'
import deepEqual from 'deep-equal'
import jwt_decode from 'jwt-decode'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import loginClientVariables from 'javascript/views/admin/login/variables'

import compose from 'javascript/utils/compose'
import cmsRouteConfig from 'javascript/routes/admin'

import { AUTH_TOKEN } from 'javascript/utils/constants'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'

// User
import UserStore from 'javascript/stores/user'
import * as UserActions from 'javascript/actions/user'

// Stylesheets
import 'stylesheets/admin/base'
import 'stylesheets/core/components/content-blocks/base'

// Components
import AdminDashboardView from 'javascript/views/admin/dashboard'
import AuthComponent from 'javascript/components/auth-component'
import Header from 'javascript/components/admin/layout/header'
import IEWarning from 'javascript/components/ie-warning'
import Login from 'javascript/views/admin/login'
import ModalRenderer from 'javascript/components/modal-renderer'
import NotFound from 'javascript/components/not-found'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import SupportArticleLink from 'javascript/components/admin/support-article-link'
import SuspenseLoader from 'javascript/components/suspense-loader'
import StylePrefixProvider from 'javascript/utils/style-prefix/style-prefix-provider'

// Services
import { hasAdminPanelAccess, isInternal } from 'javascript/services/user-permissions'

// Hoc
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import { withFeAvailablityCheck } from 'javascript/utils/hooks/use-fe-available-state'
import { ImpersonationStateComponent } from 'javascript/utils/hooks/use-impersonation-state'
import { ImpersonationTopBar } from 'javascript/components/impersonation-top-bar'
import ErrorBoundary from 'javascript/components/error-boundary'


class AdminLayout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      isLoading: true,
      routes: [],
      theme: null
    }
    this.adminHome = AdminDashboardView
    if (!props.theme.features.applications.cms) {
      window.location = '/'
    }
  }

  componentWillMount() {
    UserStore.on('authenticated', this.getUser)
    UserStore.on('change', this.updateUser)
  }

  componentWillUnmount() {
    UserStore.removeListener('authenticated', this.getUser)
    UserStore.on('change', this.updateUser)
  }

  componentDidMount() {
    let authToken = safeLocalStorage.getItem(AUTH_TOKEN)
    if (authToken) {
      UserActions.restoreSession(authToken, this.props.theme)
    } else {
      this.setState({
        isLoading: false
      })
    }
    if (this.props.videoProviders.wistia) {
      const script = document.createElement('script')
      script.src = '//fast.wistia.com/assets/external/api.js'
      document.head.appendChild(script)
      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.href = '//fast.wistia.com/assets/external/uploader.css'
      document.head.appendChild(style)
    }
    this.setState({
      routes: this.createRoutes()
    })
  }

  componentDidUpdate(prevProps) {
    if (!deepEqual(prevProps.theme.features, this.props.theme.features) ||
        !deepEqual(prevProps.theme.localisation, this.props.theme.localisation)) {
      this.setState({
        routes: this.createRoutes()
      })
    }
  }

  createRoutes = (user = this.state.user) => {
    const basePath = this.props.match.path
    const RootComponent = user ? (
      <AuthComponent
        admin
        routeConfig={{
          path: basePath,
          component: this.adminHome,
          user: true,
          permissions: []
        }}
        component={this.adminHome}
        user={user}
      />
    ) : null
    let routes = [
      <Route exact path={basePath} key={'root'} render={() => RootComponent}
      />
    ].concat(cmsRouteConfig.createRoutes(this.props.theme, user).map((route) => (
        <Route exact path={`${basePath}/${route.path}`}
          key={`${basePath}/${route.path}`}
          render={(props) => (
            <AuthComponent {...props}
              admin
              component={route.component}
              routeConfig={route}
              user={user}
            />
          )}
        />
    )), [
      <Route key={'notFound'} component={ NotFound } />
    ])
    return routes
  }

  renderMessage = () => {
    const { location } = this.props
    if(location.state && location.state.hasOwnProperty('notification')) {
      let notification = location.state.notification
      let classes = 'notification notification--' + notification.type
        return <p className={ classes }>{ notification.message }</p>
    }
  }

  getUser = () => {
    const user = jwt_decode(UserStore.getToken()).sub
    UserActions.getUser(user, this.props.theme)
  }

  updateUser = () => {
    const user = UserStore.getUser()
    if (user && hasAdminPanelAccess(user)) {
      this.setState({
        user,
        routes: this.createRoutes(user),
        isLoading: false
      })
    } else {
      window.location.href = '/'
    }
  }

  endSession = (e) => {
    e.preventDefault()
    UserActions.clearSession(this.props.theme)
  }

  renderError() {
    return (
      <div className="page">
        <main class="login">
          <div className="container">
            <img src={this.props.loginCV.logo} className="logo" />
            <form className="form panel" >
              <div className="form__control"><p className="form__error">{ this.state.error }</p></div>
              <div className="u-center-content"><a href={`/${this.props.theme.variables.SystemPages.account.path}`} className="button button--filled">Back to your account</a></div>
            </form>
          </div>
        </main>
      </div>
    )
  }

  render () {
    const { user } = this.state
    const { location, history, theme } = this.props

    if(this.state.isLoading) {
      return (<div></div>)
    }
    if(this.state.error) {
      {this.renderError()}
    }
    const adminContent = user ? (
      <>
        <IEWarning />
        <div className="custom admin cms-page">
          <ImpersonationStateComponent>
            {({ status, stopImpersonation }) => {
              if (status === 'impersonating' && !user) {
                return stopImpersonation()
              }
              return (
                <>
                  {status === 'impersonating' && (
                    <ImpersonationTopBar onPressStop={stopImpersonation} firstName={user['first-name']} lastName={user['last-name']} />
                  )}
                </>
              )
            }}
          </ImpersonationStateComponent>
          <SupportArticleLink />
          <Header endSession={ this.endSession } user={user} />
          <ErrorBoundary user={user} reset={{ text: 'Continue', route: '/admin'}} >
            <Switch>
              <Redirect from="/:url*(/+)" to={location.pathname.slice(0, -1)} />
              { this.state.routes }
            </Switch>
          </ErrorBoundary>
          {theme.features.intercomWidget && isInternal(user) && process.env.TARGET_ENV === 'production' &&
            <Intercom appID={theme.features.intercomWidget} {
              ...{
                user_id: `${user.id}-${theme.localisation.client}`,
                email: user.email,
                name: `${user['first-name']} ${user['last-name']}`
              }
            } />
          }
          <ModalRenderer />
          <SmallScreenMessage page="ONE admin"/>
        </div>
      </>
    ) : (
      <Login />
    )
    return (
      <div id="admin">
        <StylePrefixProvider entryPoint={'admin'}>
          {adminContent}
        </StylePrefixProvider>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withVideoProviders,
  withFeAvailablityCheck,
  withClientVariables('loginCV', loginClientVariables)
)

export default enhance(AdminLayout)
