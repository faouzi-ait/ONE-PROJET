import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Modal from 'javascript/components/modal'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportHotelsIndex = (props) => {
  const { localisation } = useTheme()
  useEffect(() => {
    if (props.deleteError) {
      props.modalState.hideModal()
      setTimeout(() => {
        props.modalState.showModal(({ hideModal }) => {
          return (
            <Modal
              closeEvent={ hideModal }
              title="Warning" modifiers={['']}
              titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
              <div className="cms-modal__content">
                <div>
                  <p>Hotel was <strong>NOT</strong> deleted</p>
                  <p>This hotel has associated hotel-reservations</p>
                </div>
              </div>
            </Modal>
          )
        })
      }, 600)
    }
  }, [props.deleteError])

  const mapHotelResources = () => {
    return (props.resources || []).map((resource) => ({
      ...resource,
      name: resource.location?.name,
      hotelName: resource.name,
    }))
  }

  const renderUpdateResource = (resource) => {
    const { marketId } = props
    props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/hotel/${resource.id}/edit`)
  }

  const renderCreateResource = () => {
    const { marketId } = props
    props.history.push(`/admin/${localisation.passport.market.path}/${marketId}/hotel/new`)
  }

  const renderResourceFields = (resource) => (
    <>
      <td>{ resource['hotelName'] }</td>
      <td>{ resource['rooms'] }</td>
      <td>{ resource['occupied-rooms'] }</td>
      <td>{ resource['remaining-rooms'] }</td>
      <td>{ resource['active'] ? 'Yes' : 'No' }</td>
    </>
  )

  const renderSubHeading = () => (
    <tr className="cms-table__row--bold" key={'sub-heading'}>
      <td>Location</td>
      <td>Name</td>
      <td>Total Rooms</td>
      <td>Used</td>
      <td>Remaining</td>
      <td>Active</td>
      <td></td>
    </tr>
  )

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    resourceName: localisation.passport.hotel.upper,
    renderCreateResource,
    renderUpdateResource,
    renderSubHeading,
    renderResourceFields,
    resources: mapHotelResources(),
  }
  if (props.locationsLength) {
    return props.renderTableIndex(indexHelperProps, 6)
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
    const hotelsReduxResource = nameSpaced('passport', useReduxResource('passport-hotel', 'passport/hotels', relation))
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', relation))
    const locations = locationsReduxResource.getReduxResources()
    const locationsLength = locations ? locations.length : -1
    const [deleteError, setDeleteError] = useState(null)

    const getHotels = () => {
      hotelsReduxResource.findAllFromOneRelation(relation, {
        include: 'location',
        fields: {
          'passport-hotels': 'active,name,rooms,remaining-rooms,occupied-rooms,location',
        }
      })
    }

    useWatchForTruthy(hotelsReduxResource.mutationState.errored, () => {
      setDeleteError(hotelsReduxResource.mutationState.errors)
    })

    useEffect(() => {
      getHotels() // a location has been deleted - refetch hotels
    }, [locationsLength])

    useWatchForTruthy(hotelsReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    return {
      ...props,
      marketId,
      deleteError,
      deleteResource: hotelsReduxResource.deleteResource,
      resources: hotelsReduxResource.getReduxResources(),
      locationsLength
    }
  })
)

export default enhance(PassportHotelsIndex)
