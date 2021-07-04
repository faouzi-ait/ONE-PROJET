import React from 'react'
import AssetMaterialActions from 'javascript/actions/asset-materials'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import HelperComponent from 'javascript/components/helper'
import Icon from 'javascript/components/icon'
import Toggle from 'javascript/components/toggle'
import withTheme from 'javascript/utils/theme/withTheme'
import withPrefix from 'javascript/components/hoc/with-prefix'
import ApplyPrefixStyles from 'javascript/components/apply-prefix-styles'

import 'stylesheets/core/components/asset'
import 'stylesheets/admin/components/cms-asset'
import compose from 'javascript/utils/compose'

import 'stylesheets/core/components/asset'

const fileIcons = (function requireAll(r) {
  return r.keys().reduce((acc, curr) => {
    acc[curr.replace('./', '').replace('.svg', '')] = r(curr)
    return acc
  }, {})
})(require.context('images/theme/file-types', false, /\.(svg)$/))


class Asset extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'asset'
    this.state = {
      asset: props.asset
    }
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  handleAssetTitleChange = (e) => {
    const asset = Object.assign({}, this.state.asset)
    asset.name = e.target.value
    this.setState({
      asset
    })
  }

  handleClick = (e) => {
    e.stopPropagation()
  }

  handleFocus = (e) => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
  }

  handleBlur = (e) => {
    const newAsset = Object.assign({}, this.state.asset)
    if (!newAsset.name || !newAsset.name.trim().length) {
      newAsset.name = 'New File'
    }
    this.setState({
      asset: newAsset,
    }, () => {
      delete newAsset.updatable
      AssetMaterialActions.updateResource(newAsset)
    })
    e.currentTarget.setSelectionRange(0, 0)
  }

  renderThumbnails = () => {
    const files = this.state.asset[ 'asset-items' ]
    const { prefix } = this.props
    if (files.length > 3) {
      const thumbs = files.filter((file, i) => i < 4)
      return (
        <div className={`${prefix}asset__media`}>
          {thumbs.map((file, i) => {
            return <img key={i} src={file.file.thumb.url} alt="" />
          })}
        </div>
      )
    } else {
      const file = files[ 0 ]
      const type = file[ 'file-type' ].toLowerCase()
      let src = file.file.thumb?.url
      let imgClass = ''
      if (this.props.theme.features.acceptedFileTypes.icons.includes(type)) {
        src = fileIcons[ type ]
        imgClass = 'file-type'
      }
      if (src) {
        return (
          <div className={`${prefix}asset__media`}>
            <img src={src} alt="" className={imgClass} />
          </div>
        )
      }
    }
    return (
      <div className="asset__media" style={{display: 'block'}}>
        <Icon id="i-admin-asset" viewBox="0 0 36 30" style={{padding: '15px', width: '45px'}} />
      </div>
    )
  }

  render() {
    const files = this.state.asset[ 'asset-items' ]
    const { prefix } = this.props
    let fileName = 'No Files'
    if (files.length > 0) {
      fileName = this.state.asset.gallery ? 'Gallery' : files[ 0 ][ 'file-identifier' ]
    }
    return (
      <ApplyPrefixStyles
        providedClassNames={this.state.classes}
        classesToPrefix={['asset']}
        renderProp={(classNames) => {
        return (
          //@ts-ignore
          <div className={classNames} onClick={this.props.onClick}>
            {files.length > 0 &&
              this.renderThumbnails()
            }
            <div className={`${prefix}asset__details`}>
              {this.props.readOnly ? (
                <p className={`${prefix}asset__title`}>{this.state.asset.name ? (this.state.asset.name) : ('Untitled Asset')}</p>
              ) : (
                  <div className={`${prefix}asset__title`}>
                    <input type="text" className={`${prefix}asset__input`} placeholder="Add a title" value={this.state.asset.name} onClick={this.handleClick} onChange={this.handleAssetTitleChange} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                    <Icon id="i-pen" width="16" height="16" classes={`${prefix}asset__icon`} />
                  </div>
                )
              }
              <p className={`${prefix}asset__file`}>{fileName}</p>
              <p className={`${prefix}asset__size`}>{this.props.size}</p>
              {this.state.asset.restricted &&
                <span class="count count--solo count--warning">Restricted</span>
              }
            </div>
            <ClientChoice>
              <ClientSpecific client="default">
                <div>
                  <Toggle classes={this.props.selected && [ 'active' ]} />
                </div>
              </ClientSpecific>
              <ClientSpecific client="banijaygroup">
                {this.props.onClick &&
                  <div>
                    <Toggle classes={this.props.selected && [ 'active' ]} />
                  </div>
                }
              </ClientSpecific>
            </ClientChoice>
          </div>
        )
      }} />
    )
  }

}

const enhance = compose(
  withPrefix,
  withTheme,
)

export default enhance(Asset)