import React from 'react'
import ButtonExportOptions, { ExportType } from './ButtonExportOptions'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'
import SwitchOrder from 'javascript/utils/client-switch/components/switch-order'
import OrderSection from 'javascript/utils/client-switch/components/switch-order/order-section'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Icon from 'javascript/components/icon'

interface Props {
  shareList: () => void
  selectedTotal: number
  folder: {
    global: unknown
  }
  selectedList: object
  duplicateList: () => void
  exportDownload: (exportType: ExportType) => void
  canManageList: boolean
  deleteResources: () => void
  unSelectAll: () => void
  theme: CustomThemeType
  clientVariables: any
}

const ListControls = ({
  shareList,
  selectedTotal,
  folder,
  duplicateList,
  exportDownload,
  canManageList,
  deleteResources,
  unSelectAll,
  selectedList,
  theme,
  clientVariables
}: Props) => {
  const {listButtonClasses, 
    errorButtonClasses,
    exitButtonClasses,
    shareButtonClasses} = clientVariables
  return (
    <div className="list-controls__list">
      <SwitchOrder
        clientSpecificOrder={{
          'ae': [
            'actionButtons', 'exportButtons'
          ],
        }}
      >
        <OrderSection name="exportButtons" >
          {selectedTotal <= 1 && (
            <ButtonExportOptions
              className={listButtonClasses}
              exportDownload={exportDownload}
              selectedList={selectedList}
              theme={theme}
            />
          )}
        </OrderSection>
        <OrderSection name="actionButtons" >
          {selectedTotal <= 1 && !folder.global && (
            <button
              onClick={shareList}
              className={shareButtonClasses}
            >
              <ClientSpecific client="ae">
                <Icon id="i-share" className="button__icon" />
              </ClientSpecific>
              Share {theme.localisation.list.lower}
            </button>
          )}
          {selectedTotal <= 1 && folder.global && (
            <button
              className={listButtonClasses}
              onClick={duplicateList}
            >
              Duplicate
            </button>
          )}
          {canManageList && (
            <button
              className={errorButtonClasses}
              onClick={deleteResources}
            >
              <ClientSpecific client="ae">
                <Icon id="i-bin" className="button__icon" />
              </ClientSpecific>
              Delete
            </button>
          )}
          <button
            className={exitButtonClasses}
            onClick={unSelectAll}
          >
            <ClientSpecific client="ae">
              <Icon id="i-close" className="button__icon" height="12" width="12" />
            </ClientSpecific>
            Exit
          </button>
        </OrderSection>
      </SwitchOrder>
    </div>
  )
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(ListControls)