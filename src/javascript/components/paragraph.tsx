import React from 'react'

import ApplyPrefixStyles from 'javascript/components/apply-prefix-styles'
import joinClasses from 'javascript/utils/helper-functions/joinClasses'

interface Props {
  className?: string
  ignorePrefixing?: boolean
  classesToPrefix?: string[]
  [key: string]: any
}

const Paragraph: React.FC<Props> = ({
  classesToPrefix = [],
  ignorePrefixing,
  ...props
}) => {

  const classes = joinClasses([
    ...(props.className || '').split(' '),
    ...(props['class'] || '').split(' '),
  ])

  const scrubbedProps = {...props}
  delete scrubbedProps['class']

  return (
    <ApplyPrefixStyles
      providedClassNames={classes}
      classesToPrefix={classesToPrefix}
      ignorePrefixing={ignorePrefixing}
      renderProp={(classNames) => {
        return (
          //@ts-ignore
          <p
            {...scrubbedProps}
            className={classNames}
          >
            {props.children}
          </p>
        )
      }}
    />
  )
}

export default Paragraph
