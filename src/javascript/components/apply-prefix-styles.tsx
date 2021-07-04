import React, { useContext } from 'react'

import { StylePrefixContext } from 'javascript/utils/style-prefix/style-prefix-provider'

interface Props {
  classesToPrefix?: string[]
  providedClassNames: string
  ignorePrefixing?: boolean
  renderProp: (classNames: string) => any
}

const ApplyPrefixStyles: React.FC<Props> = ({
  classesToPrefix = [],
  ignorePrefixing = false,
  providedClassNames = '',
  renderProp,
}) => {
  const stylePrefixEntryPoint = useContext(StylePrefixContext)
  let prefixedClasses
  if (!ignorePrefixing && stylePrefixEntryPoint === 'admin') {
    prefixedClasses = providedClassNames.split(' ').reduce((accStr, className) => {
      for (let i = 0; i < classesToPrefix.length; i += 1) {
        if (className.indexOf(classesToPrefix[i]) === 0) {
          return `${accStr} cms-${className}`
        }
      }
      return `${accStr} ${className}`
    }, '').trim()
  }
  return renderProp(prefixedClasses || providedClassNames)
}

export default ApplyPrefixStyles