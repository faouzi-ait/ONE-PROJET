import React from 'react'

import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'

import Checkbox from 'javascript/components/custom-checkbox'

interface Props {
}

const BulkSelectAll: React.FC<Props> = ({

}) => {
  const {
    isSelectAllChecked,
    selectAllResouces,
  } = useBulkSelectionState()

  return (
    <div className="bulk-manager__select-all">
      <span className="bulk-manager__select-all-label">{isSelectAllChecked() ? 'Unselect All' : 'Select All'}</span>
      <Checkbox
        labeless={true}
        id={`bulk_select_all`}
        checked={isSelectAllChecked()}
        onChange={({target}) => selectAllResouces(target.checked)}
      />
    </div>
  )
}

export default BulkSelectAll

