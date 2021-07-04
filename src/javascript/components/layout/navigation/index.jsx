// React
import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import deepEqual from 'deep-equal'
const pluralize = require('pluralize')

import clientNavigation from 'javascript/config/client-navigation'
import headerClientVariables from 'javascript/components/layout/header/variables'
import allClientVariables from './variables'

import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import OrderSection from 'javascript/utils/client-switch/components/switch-order/order-section'
import SwitchOrder from 'javascript/utils/client-switch/components/switch-order'


import { useAnonymousAccessState } from 'javascript/views/anonymous-access/use-anonymous-access-validation'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

// Stylesheets
import 'stylesheets/core/components/navigation'

// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'

// Services
import { checkFEPermissions, hasAdminPanelAccess } from 'javascript/services/user-permissions'
import { getKidsPage } from 'javascript/utils/helper-functions/get-kids-page'


class Navigation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      adminView: props.user && hasAdminPanelAccess(props.user),
      validatedMenuItems: this.validateMenuItems(props.menuItems)
    }
    this.kids = getKidsPage(props.theme)
  }

  componentDidUpdate(prevProps) {
    if (
      !deepEqual(prevProps.theme.features, this.props.theme.features) ||
      !deepEqual(prevProps.theme.localisation, this.props.theme.localisation) ||
      !deepEqual(prevProps.user, this.props.user)
    ) {
      this.setState({
        validatedMenuItems: this.validateMenuItems(this.props.menuItems)
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      adminView: nextProps.user && hasAdminPanelAccess(nextProps.user)
    })
  }

  validateMenuItems = (menuItems) => {
    const checkMenuItem = clientNavigation(this.props.theme, this.props.user)
    const removeMenuItemsWithoutPermission = (items = []) => {
      return items.reduce((acc, item) => {
        const navData = checkMenuItem(item.slug, item.title)
        if (navData.shouldRender) {
          acc.push({
            ...navData,
            ...item,
            children: item.children?.length > 0 ? removeMenuItemsWithoutPermission(item.children) : []
          })
        }
        return acc
      }, [])
    }
    return removeMenuItemsWithoutPermission(menuItems)
  }

  renderSisterLink = () => {
    const isProduction = process.env.TARGET_ENV === 'production'
    return <ClientProps
      clientProps={{
        defaultLink: {
          'banijaygroup': isProduction ? 'https://www.banijayrights.com' : 'https://banijay.staging.rawnet.one',
        },
        kidsLink: {
          'banijaygroup': isProduction ? 'https://www.zodiakkids.com' : 'https://kids.banijay.staging.rawnet.one',
        },
      }}
      renderProp={(clientProps) => {
        return (
          <li className="navigation__item navigation__item--divide" key={'sisterLink'}>
            <a href={this.kids ? clientProps.defaultLink: clientProps.kidsLink} className="navigation__link">
              { this.kids ? 'Banijay Rights Home' : 'Zodiak Kids Home' }
            </a>
          </li>
        )
      }}
    />
  }

  renderUserControls = () => {
    const { user, location, theme } = this.props
    if(location.pathname !== `/${theme.variables.SystemPages.login.path}`) {
      if(user) {
        return (
          <li className="navigation__item">
            <Button onClick={ this.props.endSession } className="navigation__link button-nav">Logout</Button>
          </li>
        )
      } else {
        return (
          <span>
            <li className="navigation__item">
              <NavLink to="/register" className="navigation__link button-nav">Register</NavLink>
            </li>
          </span>
        )
      }
    }
  }

  renderHomeLink = (subItems) => (
    <ClientProps
      clientProps={{
        homeText: {
          'default': 'Home',
          'banijaygroup': this.kids ? 'Zodiak Kids Home' : 'Banijay Rights Home'
        },
        homeLinkClasses: {
          default: 'navigation__link',
          'ae': 'navigation__link navigation__link--with-icon'
        }
      }}
      renderProp={(clientProps) => (
        <li className="navigation__item navigation__item--divide" key={'home'} >
          <NavLink exact to="/" activeClassName="navigation__link--is-active" className={clientProps.homeLinkClasses}>
            <ClientSpecific client="ae">
              <Icon id="i-home" width="69" height="57" classes="navigation__icon" />
            </ClientSpecific>
            {clientProps.homeText}
          </NavLink>
          {subItems.length > 0 && (
            <ul className="navigation__sub-nav">
              {subItems}
            </ul>
          )}
        </li>
      )}
    />
  )

  renderAdminLink = () => {
    if (this.state.adminView && this.props.theme.features.applications.cms) {
      return (
        <li className="navigation__item navigation__item--divide lg-hidden" key={'oneAdmin'} >
          <NavLink to={'/admin'} className="navigation__link">ONE Admin</NavLink>
        </li>
      )
    }
  }

  getSubMenu = (menuItem) => {
    const { localisation, variables } = this.props.theme
    return  menuItem.children.map((subItem) => {
      const subItemClasses = subItem.hideOnMobile ? 'navigation__sub-item lg-hidden' : 'navigation__sub-item'
      return (
        <ClientProps
          clientProps={{
            icon: {
              'default': null,
              'ae': subItem.navTitle === variables.SystemPages.profile.upper && 'i-user' ||
                subItem.navTitle === variables.SystemPages.meeting.upper && 'i-meetings' ||
                subItem.navTitle === variables.SystemPages.list.upper && 'i-lists' ||
                subItem.navTitle === variables.SystemPages.approvals.upper && 'i-approvals' ||
                subItem.navTitle === variables.SystemPages.reporting.upper && 'i-reporting' || null
            }
          }}
          renderProp={(clientProps) => {
            return (
              <li className={subItemClasses} key={subItem.id}>
                <NavLink className="navigation__link" activeClassName="navigation__link--is-active" to={`${menuItem.slug}${subItem.slug}`}>
                  {clientProps.icon &&
                    <Icon id={clientProps.icon} width="30" classes="navigation__icon" />
                  }
                  {subItem.navTitle}
                </NavLink>
              </li>
            )
          }}
        />
      )
    })
  }

  renderNavItem = (menuItem) => {
    const { localisation, features, variables } = this.props.theme
    const { anonymousAccessDetails } = this.props
    const hasIcon = this.props.navigationCV.icon(menuItem.navTitle, this.props.theme)
    const navItems = []
    if (menuItem.slug === `/${variables.SystemPages.home.lower}`) {
      if (features.applications.frontend) {
        navItems.push(this.renderHomeLink(menuItem.children.length > 0 ? this.getSubMenu(menuItem) : []))
        if (variables.KidsVersion) {
          navItems.push(this.renderSisterLink())
        }
      }
    } else {
      const needsDivide =  menuItem.navType === 'sitePage' || this.props.navigationCV.cmsResourceItemsHaveDivide
      const linkClasses = [
        'navigation__link',
        location.pathname.includes(menuItem.slug) && 'navigation__link--is-active',
        hasIcon && 'navigation__link--with-icon'
      ].filter(Boolean).join(' ')
      const classes = [
        'navigation__item',
        needsDivide && 'navigation__item--divide',
        menuItem.hideOnMobile && 'lg-hidden',
        features.navigation.centeredNav && menuItem['content-positionable']?.['show-in-featured-nav'] && 'navigation__item--mobile',
      ].filter(Boolean).join(' ')
      if (menuItem.children.length > 0) {
        const subItems = this.getSubMenu(menuItem)
        navItems.push((
          <li className={classes} key={menuItem.id}>
            <NavLink to={menuItem.slug} className={linkClasses}>
              {hasIcon &&
                <Icon id={hasIcon} classes="navigation__icon" />
              }
              {menuItem.navTitle}
            </NavLink>
            <ul className="navigation__sub-nav">
              {subItems}
            </ul>
          </li>
        ))
      } else { // single item
        if (features.users.anonymousAccess.enabled && menuItem.anonymousRoute && anonymousAccessDetails) {
          navItems.push((
            <li className={classes} key={menuItem.id}>
              <NavLink className={linkClasses}
                to={`${menuItem.slug}/${anonymousAccessDetails.id}?token=${anonymousAccessDetails.token}`}
              >
                {anonymousAccessDetails.name}
              </NavLink>
            </li>
          ))
        } else {
          navItems.push((
            <li className={classes} key={menuItem.id}>
              <NavLink to={menuItem.slug} className={linkClasses}>
                {hasIcon &&
                  <Icon id={hasIcon} classes="navigation__icon" />
                }
                {menuItem.navTitle}
              </NavLink>
            </li>
          ))
        }
      }
    }
    return navItems
  }

  render() {
    const { location, navToggle, theme, headerCV, navigationCV } = this.props
    return (
      <nav role="navigation" className="navigation">
        <Button onClick={navToggle} className={navigationCV.closeButtonClasses}>
          <ClientChoice>
            <ClientSpecific client="default">
              <Icon id="i-close" classes="button__icon" />
            </ClientSpecific>
            <ClientSpecific client="fremantle">
              <Icon id="i-close" height="20" width="20" viewBox="0 0 20 20" classes="button__icon" />
            </ClientSpecific>
          </ClientChoice>
          Close
        </Button>
        <ul className="navigation__list">
          <SwitchOrder
              clientSpecificOrder={{
                'ae': [
                  'menuItems', 'userControls', 'adminLink'
                ],
              }}
            >
            <OrderSection name="adminLink" >
              {this.renderAdminLink()}
            </OrderSection>
            <OrderSection name="menuItems" >
              {this.state.validatedMenuItems.reduce((acc, menuItem, index) => ([
              ...acc,
              ...this.renderNavItem(menuItem, index)
            ]), [])}
            </OrderSection>
            <OrderSection name="userControls" >
              { theme.features.navigation.centeredNav && this.renderUserControls() }
            </OrderSection>
          </SwitchOrder>
        </ul>
      </nav>
    )
  }
}

const enhance = compose(
  withRouter,
  withTheme,
  withClientVariables('headerCV', headerClientVariables),
  withClientVariables('navigationCV', allClientVariables),
  withHooks((props) => {
    const { getValidToken } = useAnonymousAccessState()
    return {
      anonymousAccessDetails: getValidToken(),
    }
  }),
)

export default enhance(Navigation)