// React
import React from 'react'
import enhanceWithClickOutside from 'react-click-outside'

// Components
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'

// Stylesheets
import 'stylesheets/admin/components/action-menu'

class ActionMenuClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpened: false
    }
    this.toggleMenu = this.toggleMenu.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  handleClickOutside() {
    this.setState({
      isOpened: false
    })
  }

  toggleMenu(e) {
    this.setState({
      isOpened: !this.state.isOpened
    })
  }

  render() {
    let classes = this.state.isOpened ? 'action-menu action-menu--is-open' : 'action-menu'
    return (
      <div className={classes}>

        <button className={`action-menu__trigger ${this.props.large && 'action-menu__trigger--large'}`} onClick={this.toggleMenu} disabled={this.props.disabled}>
          {this.props.name}
          <Icon width="13" height="8" id="i-admin-drop-arrow" classes="action-menu__icon" />
        </button>
        <ul className="action-menu__list" onClick={this.handleClickOutside}>
          {this.props.children}
        </ul>
      </div>
    )
  }

}

const ActionMenuItem = (props) => {
  let classes = props.divide ? 'action-menu__item action-menu__item--divide' : 'action-menu__item'
  const getLinkNode = () => {
    if (props.onClick) {
      return <span className="action-menu__action" onClick={props.onClick}>{props.label}</span>
    } else if (props.link) {
      if (props.target === '_blank') {
        return <a href={props.link} className="action-menu__action" target={props.target}>{props.label}</a>
      }
      return <NavLink to={props.link} className="action-menu__action">{props.label}</NavLink>
    } else if (props.href) {
      return <a href={props.href} className="action-menu__action" target={props.target || '_self'}>{props.label}</a>
    }
    return <span className="action-menu__action">{props.label}</span>
  }

  return (
    <li className={classes}>
      { getLinkNode() }
    </li>
  )
}

const ActionMenu = enhanceWithClickOutside(ActionMenuClass)

export {
  ActionMenu,
  ActionMenuItem
}