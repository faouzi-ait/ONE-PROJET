import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Form from 'javascript/views/admin/passport/hotels/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-page-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportHotelsEdit = (props) => {
  const { marketId } = props
  const { localisation: Localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={Localisation.passport.hotel.upper}
      backPath={`/admin/${Localisation.passport.market.path}/${marketId}/edit`}
      backName={pluralize(Localisation.passport.market.upper)}
      form={Form}
      formProps={{
        isEditing: true,
        resource: props.resource,
      }}
    />
  )
}

const enhance = compose(
  withLoader,
  withHooks(props => {
    const { marketId, hotelId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const hotelsReduxResource = nameSpaced('passport', useReduxResource('passport-hotel', 'passport/hotels', relation))
    let isHotelLoading = hotelsReduxResource.queryState.isLoading

    useEffect(() => {
      if (marketId) {
        hotelsReduxResource.findOne(hotelId, {
          include: 'location',
          fields: {
            'passport-hotels': 'active,name,rooms,location',
            'passport-locations': 'name'
          }
        })
      }
    }, [])

    useEffect(() => {
      props.pageIsLoading([isHotelLoading])
    }, [isHotelLoading])

    return {
      ...props,
      marketId,
      resource: hotelsReduxResource.getReduxResource(hotelId),
    }
  })
)

export default enhance(PassportHotelsEdit)