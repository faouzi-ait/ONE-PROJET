import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Form from 'javascript/views/admin/passport/markets/form'
import PassportContentsIndex from 'javascript/views/admin/passport/contents/index'
import PassportEventsIndex from 'javascript/views/admin/passport/events/index'
import PassportHotelsIndex from 'javascript/views/admin/passport/hotels/index'
import PassportLocationsIndex from 'javascript/views/admin/passport/locations/index'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportMarketsEdit = (props) => {
  const { localisation: Localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={Localisation.passport.market.upper}
      backPath={`/admin/${Localisation.passport.market.path}`}
      backName={pluralize(Localisation.passport.market.upper)}
      form={Form}
      formProps={{
        isEditing: true,
        resource: props.market,
      }}
    >
      <PassportLocationsIndex />
      <PassportHotelsIndex />
      <PassportEventsIndex />
      <PassportContentsIndex />
    </IndexPageHeader>
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
          'passport-markets': 'active,end-date,flight-schedule-pdf,name,remove-flight-schedule-pdf,start-date,travel-end-date,'
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isMarketLoading, isLocationLoading, isHotelLoading, isEventLoading, isContentLoading])
    }, [isMarketLoading, isLocationLoading, isHotelLoading, isEventLoading, isContentLoading])

    return {
      ...props,
      marketId,
      market: marketsReduxResource.getReduxResource(marketId),
    }
  })
)

export default enhance(PassportMarketsEdit)