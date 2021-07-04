import React from 'react'

import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'

import SlideToggle from 'javascript/components/slide-toggle'
import BulkSelectAll from 'javascript/components/bulk-selection/bulk-select-all'

interface Props {
  alwaysVisible?: boolean
}

const BulkToggleButton: React.FC<Props> = ({
  alwaysVisible = false,
}) => {
  const {
    bulkActionsExist,
    isBulkSelectionView,
    toggleBulkSelectionView
  } = useBulkSelectionState()

  if (!bulkActionsExist()) return null

  if (alwaysVisible || !isBulkSelectionView()) {
    return (
      <SlideToggle
        classes={['small']}
        identifier="bulkActions"
        off="Bulk Actions"
        onChange={toggleBulkSelectionView}
        checked={isBulkSelectionView()}
      />
    )
  }
  return (
    <BulkSelectAll />
  )
}

export default BulkToggleButton
