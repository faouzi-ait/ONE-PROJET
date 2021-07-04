// React
import React, { Component, useEffect, useState } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import deepEqual from 'deep-equal'

import jwt_decode from 'jwt-decode'
import ReactDOM from 'react-dom'
import Intercom from 'react-intercom'

// Stylesheets
import 'stylesheets/core/base'
import 'stylesheets/core/components/content-blocks/base'

import { AUTH_TOKEN } from 'javascript/utils/constants'
import { findAllByModel } from 'javascript/utils/apiMethods'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'
import { validateAnalyticsCookiePolicy } from 'javascript/application'
import { withFeAvailablityCheck } from 'javascript/utils/hooks/use-fe-available-state'
import appRouteConfig from 'javascript/routes/application'
import compose from 'javascript/utils/compose'
import store from 'javascript/utils/store'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import useUnregisteredTokenState from 'javascript/views/virtual-screening/use-unregistered-token-state'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'

import { getKidsPage } from 'javascript/utils/helper-functions/get-kids-page'
import { isBuyer, isInternal } from 'javascript/services/user-permissions'
import getQueryStringParams from 'javascript/utils/helper-functions/get-query-string-params'

import applicationClientVariables from './variables'
import googleAnalyticsClientVariables from 'javascript/components/google-analytics/variables'

// Actions
import * as UserActions from 'javascript/actions/user'

// Stores
import UserStore from 'javascript/stores/user'
import UsersStore from 'javascript/stores/users'

// Components
import { ImpersonationStateComponent } from 'javascript/utils/hooks/use-impersonation-state'
import { ImpersonationTopBar } from 'javascript/components/impersonation-top-bar'
import AuthComponent from 'javascript/components/auth-component'
import CookieBanner from 'javascript/components/cookie-policy/cookie-banner'
import ErrorBoundary from 'javascript/components/error-boundary'
import ExcludePageHeaderNavigation from 'javascript/components/exclude-page-header-navigation'
import Footer from 'javascript/components/layout/footer'
import GA from 'javascript/components/google-analytics'
import Header from 'javascript/components/layout/header'
import HomeView from 'javascript/views/home'
import IEWarning from 'javascript/components/ie-warning'
import Modal from 'javascript/components/modal'
import ModalRenderer from 'javascript/components/modal-renderer'
import Navigation from 'javascript/components/layout/navigation'
import NotFoundComponent from 'javascript/components/not-found'
import Notification from 'javascript/components/notification'
import Session from 'javascript/views/sessions/new'


class ApplicationLayout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      navigation: false,
      megaMenu: false,
      login: false,
      user: null,
      checkingUser: true,
      routes: null,
      genre: null,
      googleUserAnalytics: null

    }
    this.kids = getKidsPage(props.theme)

    this.appHome = HomeView
    if (!props.theme.features.applications.frontend && props.theme.features.users) {
      this.appHome = (props) => (
        <Redirect to={`/${this.props.theme.variables.SystemPages.account.path}`} />
      )
    } else if (!props.theme.features.applications.frontend && !props.theme.features.users) {
      window.location = '/admin'
    }
    this.browserListenStop = null
  }

  componentWillMount() {
    UserStore.on('authenticated', this.getUser)
    UserStore.on('change', this.updateUser)
    UsersStore.on('save', this.getUser)
    this.browserListenStop = this.props.history.listen((location) => {
      this.closeNavigation()
      this.closeMegaMenu()
      if (!location.state?.hideModalExempt) {
        this.hideModal()
      }
      this.changeTheme(null)
    })
  }

  componentWillUnmount() {
    UserStore.removeListener('authenticated', this.getUser)
    UserStore.removeListener('change', this.updateUser)
    UsersStore.removeListener('save', this.getUser)
    this.browserListenStop()
  }

  componentDidUpdate(prevProps, prevState) {
    const { theme } = this.props
    if (!deepEqual(prevProps.theme.features, theme.features) ||
        !deepEqual(prevProps.theme.localisation, theme.localisation) ||
        !deepEqual(prevProps.theme.variables.SystemPages, theme.variables.SystemPages)) {
      this.setState({
        routes: this.createRoutes(UserStore.getUser())
      }, this.props.fetchResources({resetSystemPages: true}))
    }
    if (prevState.checkingUser && prevState.checkingUser !== this.state.checkingUser) {
      this.props.fetchResources({resetSystemPages: true})
    }
    this.initializeGoogleAnalytics()
  }

  componentDidMount() {
    let authToken = safeLocalStorage.getItem(AUTH_TOKEN) || this.getCookie(AUTH_TOKEN)
    if (authToken) {
      UserActions.restoreSession(authToken, this.props.theme)
    } else {
      this.setState({ checkingUser: false })
    }

    if (this.props.videoProviders.wistia) {
      const script = document.createElement('script')
      script.src = '//fast.wistia.net/assets/external/E-v1.js'
      document.head.appendChild(script)
    }
    this.setState({
      routes: this.createRoutes()
    })
  }

  createRoutes(user) {
    const RootComponent = (
      <AuthComponent
        routeConfig={{ user: false }}
        component={this.appHome}
        user={user}
        navToggle={this.toggleNavigation}
      />
    )
    let routes = [
      <Route exact path="/" key={'root'} render={() => RootComponent} />,
    ].concat(appRouteConfig.createRoutes(this.props.theme, user).map((route) => {
      const RouteComponent = (
        <AuthComponent
          routeConfig={route}
          component={route.component}
          user={user}
          navToggle={this.toggleNavigation}
          login={this.login}
          changeTheme={this.props.applicationCV.changeTheme && this.changeTheme}
        />
      )
      return (
        <Route exact path={`/${route.path}`} key={route.path} render={() => RouteComponent} />
      )
    }), [
      <Route key={'notFound'} component={ NotFoundComponent } />
    ])
    return routes
  }

  getCookie = (name) => {
    const re = new RegExp(name + "=([^;]+)")
    const value = re.exec(document.cookie)
    return (value != null) ? unescape(value[1]) : null
  }

  getUser = () => {
    const user = jwt_decode(UserStore.getToken()).sub
    UserActions.getUser(user, this.props.theme)
  }

  updateUser = () => {
    let user = UserStore.getUser()
    const { location, history, theme } = this.props
    const { variables: { SystemPages } } = theme

    if (theme.features.hotjar.enabled && window.hj) {
      window.hj('identify', user?.id || null, {})
    }
    this.setState({
      user: user,
      routes: this.createRoutes(user),
      checkingUser: false,
      googleUserAnalytics: null
    })
    if (this.state.login) {
      this.hideModal()
      if (theme.features.dashboard.frontend && user && theme.features.applications.frontend && window.location.pathname === '/' && isBuyer(user)) {
        history.push(`/${theme.variables.SystemPages.dashboard.path}`)
      }
    }
    if (!user) {
      const pathname = theme.features.applications.frontend ? '/' : `/${SystemPages.login.path}`
      const redirectUrl = UserStore.getLogoutRedirectUrl()
      history.push(!redirectUrl ? pathname : redirectUrl)
    } else if (location.state) {
      let nextPath = location.state.nextPathname
      if (location.state['first-name'] && location.state['last-name']) { // implies it has come from logging in after /successful-registration
        nextPath = '/'
      }
      history.push(nextPath)
    } else if (getQueryStringParams(window.location.search).from) {
      history.replace(getQueryStringParams(window.location.search).from)
    } else if (window.location.pathname == `/${SystemPages.login.path}`
      || window.location.pathname == `/${SystemPages.register.path}`
      || window.location.pathname == `/${SystemPages.forgottenPassword.path}`) {
      history.push(`/${this.props.theme.variables.SystemPages.account.path}`)
    }
  }

  toggleNavigation = () => {
    this.setState({
      navigation: !this.state.navigation
    })
  }

  toggleMegaMenu = () => {
    this.setState({
      megaMenu: !this.state.megaMenu
    })
  }

  closeNavigation = () => {
    this.setState({
      navigation: false
    })
  }

  closeMegaMenu = () => {
    this.setState({
      megaMenu: false
    })
  }

  changeTheme = (genre) => {
    this.setState({
      genre
    })
  }

  login = () => {
    this.setState({
      login: true
    }, this.renderModal)
  }

  logout = () => {
    UserActions.clearSession(this.props.theme)
  }

  hideModal = () => {
    setTimeout(() => {
      this.setState({
        login: false
      }, this.props.modalState.hideModal)
    }, 500)
  }

  initializeGoogleAnalytics = () => {
    if (this.state.checkingUser) return
    const { googleAnalyticsCV, theme } = this.props
    const googleAnalyticsId = validateAnalyticsCookiePolicy(theme.features.google.analyticsId, theme.features.cookiePolicy)
    if (googleAnalyticsId && !this.state.googleUserAnalytics) {
      const userAnalytics = GA.userAnalyticsOptions(this.state.user, googleAnalyticsCV)
      GA.init(googleAnalyticsId, userAnalytics)
      this.setState({
        googleUserAnalytics: userAnalytics
      })
    } else if (!googleAnalyticsId && this.state.googleUserAnalytics) {
      this.setState({
        googleUserAnalytics: null
      })
    }
  }

  renderModal = () => {
    if (this.state.login) {
      this.props.modalState.showModal(({ hideModal }) => (
        <Modal title="Login" modifiers={['login']} closeEvent={hideModal} wrapperStyling={{overflow: 'hidden'}}>
          <Session inpage={true} intro={true} />
        </Modal>
      ))
    }
  }

  renderMessage = () => {
    const { location } = this.props
    if (location.state && location.state.hasOwnProperty('notification')) {
      let notification = location.state.notification
      return <Notification display={true} classes={[notification.type]} count={notification.count || 0}>{notification.message}</Notification>
    }
  }

  render() {
    if (this.props.isLoading || this.state.checkingUser) {
      return (
        <div className="loader"></div>
      )
    } else {
      const { location, theme, applicationCV } = this.props
      const { user, navigation, megaMenu, googleUserAnalytics } = this.state
      const classes = ['page', this.kids && 'kids', navigation && 'nav-open', megaMenu && 'menu-open'].filter(v => v).join(' ')

      return (
        <div id="app">
          <div className="custom app">
            {googleUserAnalytics &&
              <GA.RouteTracker options={googleUserAnalytics} />
            }
            <ImpersonationStateComponent>
              {({ status, stopImpersonation }) => {
                if (status === 'impersonating' && !user) {
                  return stopImpersonation()
                }
                return (
                  <>
                    {status === 'impersonating' && (
                      <ImpersonationTopBar
                        onPressStop={stopImpersonation}
                        firstName={user['first-name'].trim()}
                        lastName={user['last-name'].trim()}
                      />
                    )}
                  </>
                )
              }}
            </ImpersonationStateComponent>

            <IEWarning />

            <div className={classes}>
              {this.state.navigation &&
                <div className="page__cover" onClick={this.toggleNavigation}></div>
              }
              {this.state.megaMenu &&
                <div className="page__cover page__cover--menu" onClick={this.toggleMegaMenu}></div>
              }
              {this.renderMessage()}

              <ExcludePageHeaderNavigation>
                <Header
                  navToggle={this.toggleNavigation}
                  menuToggle={this.toggleMegaMenu}
                  newSession={this.login}
                  endSession={this.logout}
                  user={this.state.user}
                  location={location}
                  theme={this.state.theme}
                  privatePages={this.props.privatePages}
                  featuredMenuItems={this.props.featuredMenuItems}
                  megaMenuItems={this.props.megaMenuItems}
                  genre={applicationCV.changeTheme && this.state.genre}
                />

                <Navigation
                  location={location}
                  newSession={this.login}
                  endSession={this.logout}
                  navToggle={this.toggleNavigation}
                  user={this.state.user}
                  menuItems={this.props.mainMenuItems}
                  collections={this.state.collections}
                />
              </ExcludePageHeaderNavigation>

              <div className="page__wrapper">
                <ErrorBoundary reset={{ text: 'Homepage', route: '/'}}>
                  <Switch>
                    <Redirect from="/:url*(/+)" to={`${location.pathname.slice(0, -1)}${location.search}`} />
                    { this.state.routes }
                  </Switch>
                </ErrorBoundary>
              </div>
              {(applicationCV.showFooterOnMeetings || location.pathname !== `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}`) &&
                !location.pathname.includes(`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.meeting.path}/virtual`) &&
                <Footer menuItems={this.props.footerMenuItems} />
              }
              {theme.features.intercomWidget && user && isInternal(user) && process.env.TARGET_ENV === 'production' &&
                <Intercom appID={theme.features.intercomWidget} vertical_padding={70} {
                  ...{
                    user_id: `${user.id}-${theme.localisation.client}`,
                    email: user.email,
                    name: `${user['first-name']} ${user['last-name']}`
                  }
                } />
              }
            </div>
            <ModalRenderer />
            <CookieBanner />
          </div>
        </div>
      )
    }
  }
}

const slugRoute = (resource, theme) => {
  switch (resource.type) {
    case 'catalogues': {
      return `/custom-${theme.localisation.catalogue.path}/${resource.slug}`
    }
    default: {
      return `/${resource.slug}`
    }
  }
}

const makeMenuItem = (contentPosition, theme) => {
  const resource = contentPosition['content-positionable']
  return {
    ...contentPosition,
    title: resource.title || resource.name,
    slug: slugRoute(resource, theme),
    published: resource.hasOwnProperty('published') ? resource.published : true,
    children: [],
  }
}


export const fetchMenuItems = (menuType, systemPages, theme) => new Promise((resolve, reject) => {
  if (!systemPages?.length) return resolve(null)
  const isMenuItemPublished = (resource) => resource.hasOwnProperty('published') ? resource.published : true

  findAllByModel('content-positions', {
    include: ['content-positionable'],
    fields: ['position', 'content-positionable', 'parent-id', 'navigation-context', 'parent'],
    includeFields: {
      pages: ['title', 'slug', 'published', 'show-in-featured-nav', 'page-type'],
      collections: ['title', 'slug', 'published', 'show-in-featured-nav'],
      catalogues: ['name', 'slug']
    },
    filter: {
      'navigation-type': menuType
    }
  }).then((response) => {
    const parentIndices = {}
    const subMenuItems = []
    let topLevelIndex = 0
    const menuItems = response.reduce((acc, item) => {
      if (item['content-positionable'] && isMenuItemPublished(item['content-positionable'])) {
        const pageStatus = systemPages.includesSlugAndEnabledFeature(item['content-positionable'].slug)
        if (pageStatus.systemPage && !pageStatus.enabled) return acc
        if (item['parent-id']) {
          subMenuItems.push(makeMenuItem(item, theme))
        } else {
          parentIndices[item.id] = topLevelIndex++
          acc.push(makeMenuItem(item, theme))
        }
      }
      return acc
    }, [])
    subMenuItems.forEach((subMenuItem) => {
      if (parentIndices.hasOwnProperty(subMenuItem['parent-id'])) {
        menuItems[parentIndices[subMenuItem['parent-id']]].children.push(subMenuItem)
      }
    })
    resolve(menuItems)
  })
  .catch((error) => {
    console.error('getNavMenuItems -> ', menuType, error)
    reject(error)
  })
})


const enhance = compose(
  withTheme,
  withVideoProviders,
  withModalRenderer,
  withFeAvailablityCheck,
  withClientVariables('applicationCV', applicationClientVariables),
  withClientVariables('googleAnalyticsCV', googleAnalyticsClientVariables),
  withHooks(({
    history,
    location,
    theme
  }) => {
    const { systemPages, fetchSystemPages } = useSystemPages()
    const [privatePages, setPrivatePages] = useState(null)
    const [mainMenuItems, setMainMenuItems] = useState(null)
    const [megaMenuItems, setMegaMenuItems] = useState(theme.features.navigation.megaNav ? null : [])
    const [footerMenuItems, setFooterMenuItems] = useState(null)
    const [featuredMenuItems, setFeaturedMenuItems] = useState(theme.features.navigation.centeredNav ? null : [])
    const user = UserStore.getUser()

    const getPrivacyPages = () => {
      findAllByModel('pages', {
        fields: ['slug'],
        filter: {
          'private-page': true
        }
      }).then((response) => {
        setPrivatePages(response)
      })
    }

    const getNavMenuItems = (menuType) => {
      const setMenu = {
        'main': setMainMenuItems,
        'footer': setFooterMenuItems,
        'featured': setFeaturedMenuItems,
        'mega': setMegaMenuItems,
      }
      fetchMenuItems(menuType, systemPages, theme).then((menuItems) => {
        setMenu[menuType](menuItems)
      })
    }

    const fetchResources = ({ resetSystemPages } = {resetSystemPages: false}) => {
      if (resetSystemPages) fetchSystemPages()
      if (!systemPages?.length) return
      getPrivacyPages()
      getNavMenuItems('main')
      getNavMenuItems('footer')
      if (theme.features.navigation.centeredNav) {
        getNavMenuItems('featured')
      }
      if (theme.features.navigation.megaNav) {
        getNavMenuItems('mega')
      }
    }

    useEffect(() => {
      fetchResources()
    }, [systemPages])

    useEffect(() => {
      const url = location.pathname.substr(1).split('/')
      // If current page is private and the user is logged out - redirect to login
      if(theme.features.pages.private && (privatePages || []).find((pg) => pg.slug === location.pathname.substr(1) || pg.slug && pg.slug === url[1]) && !user) {
        history.push(`/${theme.variables.SystemPages.login.path}?from=${location.pathname}`)
      }
    }, [location, user, privatePages])

    return {
      isLoading: privatePages === null || mainMenuItems === null || footerMenuItems === null || featuredMenuItems === null || megaMenuItems === null,
      privatePages: privatePages || [],
      mainMenuItems: mainMenuItems || [],
      megaMenuItems: megaMenuItems || [],
      footerMenuItems: footerMenuItems || [],
      featuredMenuItems: featuredMenuItems || [],
      fetchResources,
    }
  })
)

export default enhance(ApplicationLayout)
