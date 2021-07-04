// React
import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import Icon from 'javascript/components/icon'
import Button from 'javascript/components/button'

import { MenuItemsType } from 'javascript/components/layout/header'

// Stylesheets
import 'stylesheets/core/components/mega-menu'

type Props = {
  menuItems: MenuItemsType[]
  menuToggle: any
}

const MegaMenu: React.FC<Props> = ({
  menuItems,
  menuToggle
}) => {
  return (
    <div className="mega-menu__popout">
      <Button onClick={menuToggle} className="mega-menu__close button button--icon">
        <Icon id="i-close" classes="button__icon" />
        Close
      </Button>
      <ul className="mega-menu__list">
        {menuItems.map((menuItem) => {
          const subMenuItems = menuItem.children.map((subMenuItem) => (
            <li className="mega-menu__sub-item" key={subMenuItem.id}>
              <NavLink className="mega-menu__link" to={`${subMenuItem.slug}`}>{subMenuItem.title}</NavLink>
            </li>
          ))
          return (
            <li className={`mega-menu__item mega-menu__item--${menuItem.title.toLowerCase().replace(/[^\w\s\-]/gi, '').replace(/\s+/g, '-')}`}>
              <NavLink to={`${menuItem.slug}`} className="mega-menu__link">{menuItem.title}</NavLink>
              {subMenuItems.length > 0 &&
                <ul className="mega-menu__sub-list">
                  {subMenuItems}
                </ul>              
              }
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withTheme,
)

export default enhance(MegaMenu)
