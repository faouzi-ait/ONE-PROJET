// React
import React from 'react'
import withTheme from 'javascript/utils/theme/withTheme'

// Components
import { NavLink } from 'react-router-dom'

// Stylesheets
import 'stylesheets/core/components/top-navigation'

class TopNavigation extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      adminView: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user){
      if (nextProps.user.isAdmin) {
        this.setState({
          adminView: true
        })
      } else {
        this.setState({
          adminView: false
        })
      }
    } else {
      this.setState({
        adminView: false
      })
    }
  }

  render () {
    const { location, navToggle, theme } = this.props
    return (
      <nav role="navigation" className="top-navigation">
        <ul className="top-navigation__list">
          {this.props.menuItems.map((menuItem) => (
            <li className="top-navigation__item" key={ menuItem.id }>
              <NavLink className="top-navigation__link" activeClassName="top-navigation__link--is-active" to={ `${menuItem.slug}` }>{ menuItem.title }</NavLink>
            </li>
          ))}
        </ul>
      </nav>
    )
  }
}

export default withTheme(TopNavigation)