import React, { useState } from 'react'
import withPrefix, { WithPrefixType } from 'javascript/components/hoc/with-prefix'
import compose from 'javascript/utils/compose'

import 'stylesheets/core/components/tooltip'
import 'stylesheets/admin/components/cms-tooltip'

interface Props extends WithPrefixType {
  content: string | null
  delay?: number
  direction?: 'top' | 'bottom' | 'left' | 'right'
  contentStyle?: any
  children: any
}

const Tooltip: React.FC<Props> = ({
  children,
  content,
  delay = 400,
  direction = 'top',
  prefix
}) => {
  let timeout
  const [active, setActive] = useState(false)

  const showTip = () => {
    if (content) {
      timeout = setTimeout(() => {
        setActive(true)
      }, delay)
    }
  }

  const hideTip = () => {
    clearInterval(timeout)
    setActive(false)
  }

  let tooltipShouldWrap = content?.length > 80
  const wrappingStyles = tooltipShouldWrap ? {
    width: '250px',
    ['white-space']: 'normal',
  } : {}

  return (
    <div
      className={`${prefix}tooltip__wrapper`}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active && (
        <div
          className={`${prefix}tooltip__content ${prefix}tooltip__content--${direction}`}
          style={wrappingStyles}
          dangerouslySetInnerHTML={{ __html: content }}
        >
        </div>
      )}
    </div>
  )
}

const enhance = compose(
  withPrefix
)

export default enhance(Tooltip)
