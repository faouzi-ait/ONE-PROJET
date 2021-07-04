import React from 'react'
import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'
import Checkbox from 'javascript/components/custom-checkbox'

interface Props {
  id: string
}

const BulkCheckbox: React.FC<Props> = ({
  children,
  id,
 }) => {
  const {
    isBulkSelectionView,
    isResourceSelected,
    toggleSelectedResource,
  } = useBulkSelectionState()

  return isBulkSelectionView() ? (
    <Checkbox
      labeless={true}
      id={`bulk_selector_${id}`}
      onChange={(e) => {
        toggleSelectedResource({
          id,
          checked: e.target.checked
        })
      }}
      checked={isResourceSelected(id)}
    />
  ) : (
    <>
      {children}
    </>
  )
}

export default BulkCheckbox
