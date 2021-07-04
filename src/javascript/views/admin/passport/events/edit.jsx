import React, { useEffect } from 'react'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Form from 'javascript/views/admin/passport/events/form'
import IndexPageHeader from 'javascript/components/index-helpers/index-page-header'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportEventsEdit = (props) => {
  const { marketId } = props
  const { localisation: Localisation } = useTheme()
  return (
    <IndexPageHeader
      resourceName={Localisation.passport.event.upper}
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
    const { marketId, eventId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const eventsReduxResource = nameSpaced('passport', useReduxResource('passport-market-event', 'passport/events', relation))
    const isEventLoading = eventsReduxResource.queryState.isLoading

    useEffect(() => {
      eventsReduxResource.findOne(eventId, {
        include: 'location',
        fields: {
          'passport-market-events': 'active,description,end-date,name,start-date,location',
          'passport-locations': 'name'
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isEventLoading])
    }, [isEventLoading])

    return {
      ...props,
      marketId,
      resource: eventsReduxResource.getReduxResource(eventId),
    }
  })
)

export default enhance(PassportEventsEdit)