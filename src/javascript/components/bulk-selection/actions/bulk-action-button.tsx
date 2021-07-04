import React, { useEffect } from 'react'

import Button from 'javascript/components/button'
import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'

interface Props {
  bulkAction: (selectedResources: string[]) => Promise<any>
  className?: string
  disabled?: boolean
  label: string
}

const BulkActionButton: React.FC<Props> = ({
  bulkAction,
  className="button",
  disabled = false,
  label,
}) => {

  const {
    getSelectedResources,
    resetSelectedResources,
    setBulkActionsExist,
  } = useBulkSelectionState()

  useEffect(() => {
    setBulkActionsExist(true)
  }, [])

  const handleBulkAction = () => {
    bulkAction(getSelectedResources())
      .then((response) => {
        resetSelectedResources()
      })
      .catch((error) => {
        if (error) {
          console.warn(`bulkAction(${label}):`, error)
        }
      })
  }

  const allowHoverStyle = disabled ? {} : {zIndex: 1}
  return (
    <Button
      type="button"
      className={className}
      disabled={disabled}
      style={allowHoverStyle}
      onClick={handleBulkAction}
    >
      {label}
    </Button>
  )
}

export default BulkActionButton
