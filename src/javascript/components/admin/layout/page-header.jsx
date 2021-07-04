// React
import React from 'react'
import HelperComponent from 'javascript/components/helper'

import 'stylesheets/admin/components/page-header'

export default class PageHeader extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'page-header'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render () {
    return (
      <header className={`${this.resourceName} ${this.state.classes}`}>
        <div className="container">
          <div>
            <h1 className={`${this.resourceName}__title`}>{ this.props.title }</h1>
            { this.props.subtitle &&
              <p className={`${this.resourceName}__copy`}>{ this.props.subtitle }</p>
            }
          </div>
          { this.props.children }
        </div>
      </header>
    )
  }
}
