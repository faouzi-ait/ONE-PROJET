import React from 'react'
import HelperComponent from 'javascript/components/helper'
import Icon from 'javascript/components/icon'
import withTheme from 'javascript/utils/theme/withTheme'

class ShareIcons extends HelperComponent {
    constructor(props) {
    super(props)
    this.resourceName = 'sharer'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  renderItem = (type) => {
    if ((!type.name || !type.name.trim().length) ||
       (!type.url || !type.url.trim().length)) return
    return (
      <li className="sharer__item" key={`share-${type.name}`}>
        <a target="_blank" href={type.url} className={`sharer__link sharer__link--${type.name}`}>
          { type.name }
          <Icon classes="sharer__icon" id={`i-${type.name}`} width={type.width || 22} height={type.height || 22} viewBox={type.viewbox} />
        </a>
      </li>
    )
  }

  render() {
    if (this.props.theme.features.shareIcons.length) {
      return (
        <div className={ this.state.classes }>
          <ul className="sharer__list">
            {this.props.theme.features.shareIcons.map((item) => {
              return this.renderItem(item)
            })}
          </ul>
        </div>
      )
    }
    return null
  }
}

export default withTheme(ShareIcons)