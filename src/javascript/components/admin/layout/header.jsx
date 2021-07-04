// React
import React, { useMemo } from 'react'
import { withRouter, Prompt } from 'react-router-dom'
import NavLink from 'javascript/components/nav-link'
import cmsNavigation from 'javascript/config/cms-navigation'
import { checkPermissions, isAdmin } from 'javascript/services/user-permissions'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'


// Stylesheets
import 'stylesheets/admin/components/brand'
import 'stylesheets/admin/components/cms-header'
import 'stylesheets/admin/components/cms-navigation'
import 'stylesheets/admin/components/sub-navigation'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import { AdminSubnavProvider } from './admin-subnav-context'
import { ImpersonationStateComponent } from 'javascript/utils/hooks/use-impersonation-state'

const isWideSubnavRoute = (theme) => (pathname) => {
  const { localisation } = theme
  const routeRegex = [
    new RegExp(`/admin/pages/\\d+/edit$`),
    new RegExp(`/admin/pages/collection/\\d+/content$`),
    new RegExp(`/admin/${localisation.programme.path}/\\d+/content$`),
    new RegExp(`/admin/passport/market/\\d+/content/\\d+/edit$`),
    new RegExp(`/admin/${localisation.news.path}/[\\w\\d-]*/edit$`),
    new RegExp(`/admin/${localisation.catalogue.path}/[\\w\\d-]*/content$`),
  ]
  for (let i = 0; i < routeRegex.length; i += 1) {
    if (routeRegex[i].test(pathname)) return true
  }
  return false
}

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      subNav: false,
      shouldShowPrompt: false,
    }
    this.isWideSubnavRoute = isWideSubnavRoute(props.theme)    
    this.browserListenStop = null
  }

  componentDidUpdate() {
    {!this.state.subNav &&
      this.props.navigation.forEach((navitem) => {
        navitem.subNav?.forEach((subNav) => {
          if (this.props.location.pathname.includes(subNav.url)) {
            this.setSubnav(navitem)
          }
        })
      })
    }
  }

  setShouldShowPrompt = (shouldShowPrompt) => {
    this.setState({ shouldShowPrompt })
  }

  setSubnav = (navitem) => {
    this.setState({
      subNav: navitem.subNav,
      navitemId: navitem.id,
      wide: navitem.wide,
      shouldFadeOut: navitem.fadeOut
    })
  }

  shouldDisplayNavLink = (link) => {
    const { user } = this.props
    return !link.subNav || isAdmin(user) || link.subNav.some(subLink => checkPermissions(user, subLink))
  }

  renderNav = () => {
    const { history } = this.props
    return this.props.navigation.map((link) => {
      let classes = link.id === this.state.navitemId ? 'cms-navigation__link cms-navigation__link--is-active' : 'cms-navigation__link'
      if (this.shouldDisplayNavLink(link)) {
        return (
          <li className="cms-navigation__item" key={link.id}>
            <Button className={classes} onClick={() => {
              history.push('/admin')
              if (window.location.pathname === '/admin') {
                this.setSubnav(link)
              }
            }}>
              <Icon {...link.icon} classes="cms-navigation__icon" />
              {link.name}
            </Button>
          </li>
        )
      }
    })
  }

  renderSubnav = () => {
    if (this.state.subNav) {
      let hasFoundMatch = false
      const links = this.state.subNav.map((link, i) => {
        let classes = this.props.location.pathname === link.url ? 'sub-navigation__link sub-navigation__link--is-active' : 'sub-navigation__link'
        let linkStyles = {}
        if (!hasFoundMatch && this.props.location.pathname === link.url) {
          hasFoundMatch = true
        }
        if (checkPermissions(this.props.user, link)) {
          if (link.isButton) {
            classes = 'button button--filled button--small'
            linkStyles = { margin: '15px 0 0 10px' }
          }
          return (
            <li key={i} className="sub-navigation__item">
              <NavLink to={link.url} className={classes} style={linkStyles}>{link.name}</NavLink>
            </li>
          )
        }
      })
      return (
        <nav
          className={`sub-navigation`}
        >
          <ul
            className={`sub-navigation__list sub-navigation__list--can-fade-out ${
              hasFoundMatch && this.state.shouldFadeOut ? 'sub-navigation__list--fade-out' : ''
            }`}
          >
            {links}
          </ul>
        </nav>
      )
    }
  }

  render() {
    let headerClass = this.state.subNav ? 'cms-header cms-header--with-sub' : 'cms-header'
    if(this.state.collapsed) {
      headerClass += ' cms-header--collapsed'
    }
    if(this.state.wide && this.props.location.pathname !== '/admin') {
      headerClass += ' cms-header--wide'
    }
    if (this.isWideSubnavRoute(this.props.location.pathname)) {
      headerClass += ' cms-header--icon-wide'
    }
    let showFELink = false
    const { theme } = this.props
    if (theme.features.applications.frontend || (!theme.features.applications.frontend && theme.features.users && (theme.features.users.lists || theme.features.users.meetings.enabled))) {
      showFELink = true
    }

    return (
      <ClientProps
        clientProps={{
          logo: {
            'default': require('images/theme/cms-logo.svg'),
            'all3': require('images/theme/logo-header.svg'),
            'discovery| drg': require('images/theme/cms-logo.png')
          },
        }}
        renderProp={(clientProps) => (
          <ImpersonationStateComponent>
            {({ status }) => (
              <AdminSubnavProvider value={{ ...this.state, setShouldShowPrompt: this.setShouldShowPrompt }}>
                <header role="banner" className={headerClass} style={status === 'impersonating' ? { marginTop: '75px'} : {}}>
                  <Button type="button" className="cms-header__toggle" onClick={()=>this.setState({collapsed:!this.state.collapsed})}>
                    <Icon width="8" height="13" id="i-right-arrow" classes="cms-header__toggle-icon" />
                  </Button>
                  <nav role="navigation" className="cms-navigation">
                    <ul className="cms-navigation__list">
                      <li className="cms-navigation__item">
                        <Button className="cms-brand" onClick={() => {
                          this.props.history.push('/admin')
                          this.setSubnav(false)
                        }}>
                          <img src={clientProps.logo} />
                        </Button>
                      </li>
                      {this.renderNav()}
                      {showFELink &&
                        <li className="cms-navigation__item">
                          <a href="/" className="cms-navigation__link" id="home-button">
                            <Icon id="i-admin-home" width="25" height="25" viewBox="0 0 44 35" classes="cms-navigation__icon" />
                            {`${theme.localisation.client} Home`}
                          </a>
                        </li>
                      }
                      <li className="cms-navigation__item cms-navigation__item--logout">
                        <Button className="button" onClick={this.props.endSession}>Logout</Button>
                      </li>
                    </ul>
                  </nav>
                  {this.renderSubnav()}
                </header>
                <Prompt message="Are you sure you want to leave? Your changes will not be saved." when={this.state.shouldShowPrompt}></Prompt>
                {this.props.children}
              </AdminSubnavProvider>
            )}
          </ImpersonationStateComponent>
        )}
      />
    )
  }
}

const enhance = compose(
  withRouter,
  withTheme,
  withHooks((props) => {
    const navigation = useMemo(() => cmsNavigation.init(props), [props.theme.features, props.theme.localisation])
    return {
      ...props,
      navigation
    }
  })
)

export default enhance(Header)

