import React from 'react'
import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'

import Toggle from 'javascript/components/toggle'

interface Props {
  id: string
  children: any
  className?: string
  childButtonClasses?: string
}

const BulkToggleBox: React.FC<Props> = ({
  id,
  className,
  children,
  childButtonClasses,
}) => {
  const {
    isResourceSelected,
    toggleSelectedResource,
  } = useBulkSelectionState()

  const toggleIsChecked = isResourceSelected(id)
  return (
    <Toggle
      onClick={(e) => {
        toggleSelectedResource({
          id,
          checked: !toggleIsChecked
        })
      }}
      classes={[className, toggleIsChecked && 'active'].filter(Boolean)}
      childButtonClasses={childButtonClasses}
    >
      {children}
    </Toggle>
  )
}

export default BulkToggleBox
