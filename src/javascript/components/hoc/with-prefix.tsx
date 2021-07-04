import React, { useContext } from 'react'
import { StylePrefixContext, StylePrefixType } from 'javascript/utils/style-prefix/style-prefix-provider'

export type WithPrefixType = {
  stylePrefixEntryPoint: StylePrefixType
  prefix: 'cms-' | ''
}

const withPrefix = Component => React.forwardRef((props, refToForward) => {
  return <Component {...props} {...getPrefix()} ref={refToForward} />
})

export const getPrefix = () => {
  const stylePrefixEntryPoint = useContext(StylePrefixContext)
  return {
    stylePrefixEntryPoint,
    prefix: stylePrefixEntryPoint === 'admin' ? 'cms-' : ''
  }
}

export default withPrefix