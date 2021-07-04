import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Form from 'javascript/containers/passport/attendee/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportAttendeeEdit = (props) => {
  const { marketId } = props
  const { localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={localisation.passport.attendee}
      backPath={`/admin/${localisation.passport.market.path}/${marketId}/spreadsheet`}
      backName={localisation.passport.spreadsheet}
      form={Form}
      formProps={{
        isEditing: true,
        resource: props.resource,
        pageIsLoading: props.pageIsLoading,
        cms: true,
        returnPath: `/admin/${localisation.passport.market.path}/${marketId}/spreadsheet`
      }}
    />
  )
}

const enhance = compose(
  withLoader,
  withHooks(props => {
    const { marketId, attendeeId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const tripReduxResource = nameSpaced('passport', useReduxResource('passport-trip', 'passport/attendee', relation))
    const isTripLoading = tripReduxResource.queryState.isLoading

    useEffect(() => {
      tripReduxResource.findOne(attendeeId, {
        include: 'trip-type,trip-invoice-type,support-user,user',
        fields: {
          'passport-trips': 'avatar,email,first-name,job-title,last-name,notes,telephone-number,title,trip-type,trip-invoice-type,support-user,user',
          'passport-trip-types': 'name',
          'passport-trip-invoice-types': 'name',
          'user': 'first-name,last-name,title',
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isTripLoading])
    }, [isTripLoading])

    return {
      ...props,
      marketId,
      resource: tripReduxResource.getReduxResource(attendeeId),
    }
  })
)

export default enhance(PassportAttendeeEdit)