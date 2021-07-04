// React
import React, { useEffect } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Icon from 'javascript/components/icon'
import PassportContentsIndex from 'javascript/views/admin/passport/contents/index'
import PassportEventsIndex from 'javascript/views/admin/passport/events/index'
import PassportHotelsIndex from 'javascript/views/admin/passport/hotels/index'
import PassportLocationsIndex from 'javascript/views/admin/passport/locations/index'
import NavLink from 'javascript/components/nav-link'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'

// HOC
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'


const PassportMarketShow = (props) => {
  const { localisation: Localisation, features: Features } = useTheme()

  const marketPath = `/admin/${Localisation.passport.market.path}`
  const marketName = props.market ? props.market['name'] : ''

  const renderResource = () => {
    const { market } = props
    if (!market) return null
    return (
      <div className="container">
        <div className="page-actions">
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" link={`${marketPath}/${market.id}/edit`} />
          </ActionMenu>
        </div>
        <table className="cms-table">
          <tbody>
            <tr>
              <td><strong>Name</strong></td>
              <td>{market['name']}</td>
            </tr>
            <tr>
              <td><strong>Start Date</strong></td>
              <td>{ moment.utc(market['start-date']).format(Features.formats.shortDate) }</td>
            </tr>
            <tr>
              <td><strong>End Date</strong></td>
              <td>{ moment.utc(market['end-date']).format(Features.formats.shortDate) }</td>
            </tr>
            <tr>
              <td><strong>Closing Date</strong></td>
              <td>{ moment.utc(market['travel-end-date']).format(Features.formats.shortDate) }</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }


  return (
    <main>
      <header class="page-header">
        <div class="container">
          <div>
            <h1 class="page-header__title">{marketName}</h1>
          </div>
          <NavLink to={`/admin/${Localisation.passport.market.path}`} className="cms-button">
            <Icon width="8" height="13" id="i-admin-back" classes="cms-button__icon" />
            Back to {pluralize(Localisation.passport.market.upper)}
          </NavLink>
        </div>
      </header>
      {renderResource()}
      <PassportLocationsIndex viewOnly={true} />
      <PassportHotelsIndex viewOnly={true} />
      <PassportEventsIndex viewOnly={true} />
      <PassportContentsIndex viewOnly={true} />
    </main>
  )
}

const enhance = compose(
  withLoader,
  withHooks(props => {
    const { marketId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const marketsReduxResource = nameSpaced('passport', useReduxResource('passport-market', 'passport/markets'))
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))
    const hotelsReduxResource = nameSpaced('passport', useReduxResource('passport-hotel', 'passport/hotels', relation))
    const eventsReduxResource = nameSpaced('passport', useReduxResource('passport-event', 'passport/events', relation))
    const contentsReduxResource = nameSpaced('passport', useReduxResource('passport-content', 'passport/contents', relation))
    const isMarketLoading = marketsReduxResource.queryState.isLoading
    const isLocationLoading = !Boolean(locationsReduxResource.getReduxResources())
    const isHotelLoading = !Boolean(hotelsReduxResource.getReduxResources())
    const isEventLoading = !Boolean(eventsReduxResource.getReduxResources())
    const isContentLoading = !Boolean(contentsReduxResource.getReduxResources())

    useEffect(() => {
      marketsReduxResource.findOne(marketId, {
        fields: {
          'passport-markets': 'name,start-date,end-date,travel-end-date,active'
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isMarketLoading, isLocationLoading, isHotelLoading, isEventLoading, isContentLoading])
    }, [isMarketLoading, isLocationLoading, isHotelLoading, isEventLoading, isContentLoading])

    return {
      ...props,
      market: marketsReduxResource.getReduxResource(marketId),
    }
  })
)

export default enhance(PassportMarketShow)
