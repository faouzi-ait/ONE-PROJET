import React, { useState, useEffect } from 'react'
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom'

import { fetchMenuItems } from 'javascript/views/layouts/application'
import compose from 'javascript/utils/compose'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import withUser, { WithUserType } from 'javascript/components/hoc/with-user'

import clientNavigation from 'javascript/config/client-navigation'
import Select from 'react-select'

import ClientProps from 'javascript/utils/client-switch/components/client-props'

import Icon from 'javascript/components/icon'

// Stylesheets
import 'stylesheets/core/components/account-navigation'

export interface MenuItemsType {
  id: string
  published: boolean
  slug: string
  title: string
}

interface Props extends RouteComponentProps, WithUserType, WithThemeType {
  currentPage: string
}

const AccountNavigation: React.FC<Props> = ({
  history,
  currentPage,
  theme,
  user
}) => {

  const { systemPages } = useSystemPages()
  const [validatedMenuItems, setValidatedMenuItems] = useState([])
  const checkMenuItem = clientNavigation(theme, user)

  useEffect(() => {
    fetchMenuItems('account', systemPages, theme)
    .then((menuItems) => {
      setValidatedMenuItems((menuItems || []).reduce((acc, item) => {
        const navData = checkMenuItem(item.slug, item.title)
        if (navData.shouldRender) {
          acc.push({
            ...navData,
            ...item
          })
        }
        return acc
      }, []))
    })

  }, [user, systemPages])

  const renderNavigation = () => {
    return (
      <ul className="account-navigation__list">
        {validatedMenuItems?.map((menuItem) => {
          return <ClientProps
            clientProps={{
              icon: {
                'default': null,
                'ae': menuItem.title === theme.variables.SystemPages.profile.upper && 'i-user' ||
                  menuItem.title === theme.variables.SystemPages.meeting.upper && 'i-meetings' ||
                  menuItem.title === theme.variables.SystemPages.list.upper && 'i-lists' ||
                  menuItem.title === theme.variables.SystemPages.approvals.upper && 'i-approvals' ||
                  menuItem.title === theme.variables.SystemPages.reporting.upper && 'i-reporting' || null
              }
            }}
            renderProp={(clientProps) => {
              const classes = `account-navigation__link`
              const itemClasses = menuItem.hideOnMobile ? 'account-navigation__item lg-hidden' : 'account-navigation__item'
              return (
                <li className={itemClasses}>
                  <NavLink to={`/${theme.variables.SystemPages.account.path}${menuItem.slug}`} className={classes}>
                    {clientProps.icon &&
                      <Icon id={clientProps.icon} width="34" classes="account-navigation__icon" />
                    }
                    {menuItem.title}
                  </NavLink>
                </li>
              )
              }}
            />
        })}
      </ul>
    )
  }

  const selectPage = (e) =>{
    history.push(`/${theme.variables.SystemPages.account.path}${e.value}`)
  }

  if(theme.features.navigation.accountNav && validatedMenuItems.length > 0) {
    return (
      <nav className="account-navigation">
        <div className="container">
          {renderNavigation()}
          <Select
            value={currentPage}
            className="account-navigation__select"
            onChange={selectPage}
            placeholder={theme.variables.SystemPages.account.upper}
            clearable={false}
            searchable={false}
            options={validatedMenuItems.filter(m => !m.hideOnMobile).map((menuItem) => {
              return {
                value: menuItem.slug,
                label: menuItem.title,
              }
            })}
          />
        </div>
      </nav>
    )
  }
  return null
}

const enhance = compose(
  withTheme,
  withUser,
  withRouter
)

export default enhance(AccountNavigation)
