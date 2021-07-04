import React, { useEffect } from 'react'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportEventsIndex = (props) => {
  const { localisation, features } = useTheme()

  const renderUpdateResource = (resource) => {
    const { marketId } = props
    props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/event/${resource.id}/edit`)
  }

  const renderCreateResource = () => {
    const { marketId } = props
    props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/event/new`)
  }

  const renderResourceFields = (resource) => (
    <>
      <td>{ resource.location?.name }</td>
      <td>{ moment(resource['start-date']).format(features.formats.dateTime) }</td>
      <td>{ moment(resource['end-date']).format(features.formats.dateTime) }</td>
      <td>{ resource['active'] ? 'Yes' : 'No' }</td>
    </>
  )

  const renderSubHeading = () => (
    <tr className="cms-table__row--bold" key={'sub-heading'}>
      <td>Name</td>
      <td>Location</td>
      <td>Start Date/Time</td>
      <td>End Date/Time</td>
      <td>Active</td>
      <td></td>
    </tr>
  )

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    resourceName: localisation.passport.event.upper,
    renderCreateResource,
    renderUpdateResource,
    renderSubHeading,
    renderResourceFields
  }

  if (props.locationsLength > 0) {
    return props.renderTableIndex(indexHelperProps, 5)
  }

  return null
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withIndexHelper,
  withHooks(props => {
    const { marketId } = props.match.params
    const relation = {
      'name': 'passport-market',
      'id': marketId
    }
    const eventsReduxResource = nameSpaced('passport', useReduxResource('passport-market-event', 'passport/events', relation))
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))
    const locations = locationsReduxResource.getReduxResources()
    const locationsLength = locations ? locations.length : -1

    const getEvents = () => {
      eventsReduxResource.findAllFromOneRelation(relation, {
        include: 'location',
        fields: {
          'passport-market-events': 'active,description,end-date,name,start-date,location',
          'passport-locations': 'name'
        }
      })
    }

    useEffect(() => {
      getEvents() // a location has been deleted - refetch events
    }, [locationsLength])

    useWatchForTruthy(eventsReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    return {
      ...props,
      marketId,
      deleteResource: eventsReduxResource.deleteResource,
      resources: eventsReduxResource.getReduxResources(),
      locationsLength,
    }
  })
)

export default enhance(PassportEventsIndex)
