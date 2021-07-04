import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PassportSpreadsheet from 'javascript/views/admin/passport/spreadsheet/spreadsheet'
import PassportSpreadsheetConfirmations from 'javascript/views/admin/passport/spreadsheet/confirmations/index'
import PassportSpreadsheetNotifications from 'javascript/views/admin/passport/spreadsheet/notifications/index'
import PassportSpreadsheetRecharge from 'javascript/views/admin/passport/spreadsheet/recharge'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportSpreadsheetIndex = (props) => {
  const { localisation } = useTheme()

  const meta = {
    title: `${localisation.client} :: ${localisation.passport.upper} ${localisation.passport.spreadsheet}`,
    meta: {
      description: `Edit and Create ${localisation.passport.upper} ${localisation.passport.spreadsheet}`
    }
  }

  const { market, marketId } = props
  return (
    <Meta {...meta }>
      <main>
        <PageHeader title={`Manage ${localisation.passport.spreadsheet} - ${market.name}`} >
          <NavLink to={`/admin/${localisation.passport.market.path}/${marketId}/edit`} className="cms-button">
            <Icon width="8" height="13" id="i-admin-back" classes="cms-button__icon" />
            Back to {localisation.passport.market.upper}
          </NavLink>
        </PageHeader>
        <PassportSpreadsheetNotifications />
        <PassportSpreadsheetConfirmations />
        <PassportSpreadsheetRecharge {...props} />
        <PassportSpreadsheet {...props} pageIsLoading={props.pageIsLoading} />
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
  withHooks(props => {
    const { marketId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const marketsReduxResource = nameSpaced('passport', useReduxResource('passport-market', 'passport/spreadsheet-markets', relation))
    const isMarketLoading = marketsReduxResource.queryState.isLoading

    useEffect(() => {
      marketsReduxResource.findOne(marketId, {
        fields: {
          'passport-markets': 'name,hotel-recharge-amount,trip-recharge-amount,total-recharge-amount',
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isMarketLoading])
    }, [isMarketLoading])

    useWatchForTruthy(marketsReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    return {
      ...props,
      marketId,
      market: marketsReduxResource.getReduxResource(marketId)
    }
  })
)

export default enhance(PassportSpreadsheetIndex)
