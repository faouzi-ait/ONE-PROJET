import React from 'react'
import withPrefix, { WithPrefixType } from 'javascript/components/hoc/with-prefix'

interface Props extends WithPrefixType {
  page?: string
  fixedHeight?: string
}

class SmallScreenMessage extends React.Component<Props, any> {
  render() {
    const {prefix, page, fixedHeight} =  this.props
    return (
      <div className={`${prefix}page__overlay ${fixedHeight && (prefix + 'page__overlay--fixed-height')}`}>
        <p className={`${prefix}page__message`}>{`${page ? page : 'This page'} is only compatible with screen sizes ${fixedHeight ? '1024px x 568px' : '1024px wide'} and above.`}</p>
      </div>
    )
  }
}

export default withPrefix(SmallScreenMessage)