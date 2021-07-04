// React
import React from 'react'
import withTheme from 'javascript/utils/theme/withTheme'
import NavLink from 'javascript/components/nav-link'
import HelperComponent from 'javascript/components/helper'

import 'stylesheets/core/components/breadcrumbs'

class Breadcrumbs extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'breadcrumbs'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  renderLinks = () => {
    const { paths, theme } = this.props
    if (paths.filter(p => p.name === theme.variables.SystemPages.home.upper).length === 0) {
      paths.unshift({ url: '/', name: theme.variables.SystemPages.home.upper})
    }
    let links = paths.map((path, i) => {
      if (i < (paths.length - 1)) {
        return (
          <li className="breadcrumbs__item" key={ i }>
            <NavLink to={ path.url } className="breadcrumbs__link">{ path.name }</NavLink>
          </li>
        )
      } else {
        return (
          <li className="breadcrumbs__item" key={ i }>{ path.name }</li>
        )
      }
    })
    return links
  }

  render() {
    return (
      <div className={ this.state.classes } >
        <div className="container">
          <ul className="breadcrumbs__list">
            { this.renderLinks() }
          </ul>
        </div>
      </div>
    )
  }

}

export default withTheme(Breadcrumbs)