import React, { useEffect } from 'react'
import pluralize from 'pluralize'
import useBulkSelectionState from 'javascript/components/bulk-selection/use-bulk-selection-state'

import BulkSelectAll from 'javascript/components/bulk-selection/bulk-select-all'
import BulkToggleButton from 'javascript/components/bulk-selection/bulk-toggle-button'
import Button from 'javascript/components/button'

// import 'stylesheets/components/bulk-action-manager'

interface Props {
  clearButtonClasses?: string
  hits?: number[]
  renderAsFEWidget?: boolean
  resourceName: string
  renderActions: (disabled?: boolean) => JSX.Element
}

const BulkActionManager: React.FC<Props> = ({
  clearButtonClasses = 'button button--small',
  renderAsFEWidget = false,
  hits = [],
  renderActions,
  resourceName,
}) => {
  const {
    isBulkSelectionView,
    getTotalSelected,
    resetBulkSelectionView,
    resetSelectedResources,
    setBulkActionsExist,
    setHits,
    toggleBulkSelectionView,
  } = useBulkSelectionState()

  useEffect(() => {
    setTimeout(() => {
      resetBulkSelectionView()
      resetSelectedResources()
    }, 0)
    // timeout to ensure setHits and resets do not clash with each other.
  }, [])

  useEffect(() => {
    if (renderAsFEWidget && !isBulkSelectionView()) {
      toggleBulkSelectionView()
    }
  }, [isBulkSelectionView()])

  useEffect(() => {
    setHits(hits)
  }, [hits.join(',')])

  useEffect(() => {
    if (renderActions()?.type?.name === 'BulkActionButton') {
      setBulkActionsExist(true)
    } else {
      // ActionMenu - check it has at least one valid ActionMenuItem.
      setBulkActionsExist(!!renderActions().props.children)
    }
  }, [renderActions])

  if (!isBulkSelectionView()) return null

  const totalSelected = getTotalSelected()
  let resourceNameText = ''
  if (totalSelected > 0) {
    resourceNameText = totalSelected === 1 ? resourceName : pluralize(resourceName)
  }

  const bulkLimitWarning = totalSelected === 500

  if (renderAsFEWidget) {
    return (
      <div className="bulk-manager">
        <div className="bulk-manager__basket" >
          { totalSelected > 0 && (
              <Button
                className={`${clearButtonClasses} badge`}
                onClick={resetSelectedResources}
                data-badge-content={totalSelected}
              >
                Clear Selected
              </Button>
          )}
        </div>
        <div className="bulk-manager__actions">
          {renderActions(totalSelected === 0)}
        </div>
        <BulkSelectAll />
      </div>
    )
  }

  return (
    <div className="bulk-manager">
      { bulkLimitWarning &&
        <div className="bulk-manager__limit-warning">
          Bulk Actions have a limit of 500. Records may be truncated, please refine your search
        </div>
      }
      <div className="bulk-manager__actions">
        {renderActions(totalSelected === 0)}
      </div>
      <div
        className="bulk-manager__basket"
        style={{height: `${bulkLimitWarning ? '40px' : '60px'}`}}
      >
        { totalSelected > 0 && (
          <div className="bulk-manager__basket-content">
            <span className="bulk-manager__selected-msg">{totalSelected} {resourceNameText} selected</span>
            <Button className={clearButtonClasses} onClick={resetSelectedResources}>Clear</Button>
          </div>
        )}
      </div>
      <div className="bulk-manager__toggle">
        <BulkToggleButton alwaysVisible />
      </div>
    </div>
  )
}

export default BulkActionManager