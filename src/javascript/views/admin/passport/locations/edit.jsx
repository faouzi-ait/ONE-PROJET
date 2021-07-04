import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Form from 'javascript/views/admin/passport/locations/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportLocationsEdit = (props) => {
  const { marketId } = props
  const { localisation: Localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={Localisation.passport.location.upper}
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
    const { marketId, locationId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))
    const isLocationLoading = locationsReduxResource.queryState.isLoading

    useEffect(() => {
      locationsReduxResource.findOne(locationId, {
        fields: {
          'passport-locations': 'active,address,latitude,location-type,longitude,name'
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isLocationLoading])
    }, [isLocationLoading])

    return {
      ...props,
      marketId,
      resource: locationsReduxResource.getReduxResource(locationId),
    }
  })
)

export default enhance(PassportLocationsEdit)