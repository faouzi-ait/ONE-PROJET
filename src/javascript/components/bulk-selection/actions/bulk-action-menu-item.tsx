import React from 'react'

import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'

interface Props {
  bulkAction: (selectedResources: string[]) => Promise<any>
  divide?: boolean
  label: string
}

const BulkActionMenuItem: React.FC<Props> = ({
  bulkAction,
  divide = false,
  label
}) => {

  const {
    getSelectedResources,
    resetBulkSelectionView,
    resetSelectedResources,
  } = useBulkSelectionState()

  const handleBulkAction = () => {
    bulkAction(getSelectedResources())
      .then((response) => {
        resetBulkSelectionView()
        resetSelectedResources()
      })
      .catch((error) => {
        if (error) {
          console.warn(`bulkAction(${label}):`, error)
        }
      })
  }

  const classes = divide ? 'action-menu__item action-menu__item--divide' : 'action-menu__item'
  return (
    <li className={classes}>
      <span
        className="action-menu__action"
        onClick={handleBulkAction}
      >
        {label}
      </span>
    </li>
  )
}

export default BulkActionMenuItem