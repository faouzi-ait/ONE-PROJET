import React, { useEffect, useState, Component } from 'react'
import deepmerge from 'deepmerge-concat'
import pluralize from 'pluralize'

import { capitalize } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Modal from 'javascript/components/modal'
import Resource from 'javascript/components/admin/resource'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportLocationsIndex = (props) => {
  const { localisation: Localisation } = useTheme()
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
                  <p>Location was <strong>NOT</strong> deleted</p>
                  <p>This location has associated hotel-reservations</p>
                </div>
              </div>
            </Modal>
          )
        })
      }, 600)
    }
  }, [props.deleteError])

  const renderUpdateResource = (resource) => {
    let marketId = props.marketId
    if (!marketId && resource) {
      marketId = resource.markets[0].id
    }
    if (resource && resource.id) { // could cause infinite spinner..
      props.history.push(`/admin/${Localisation.passport.market.path}/${marketId}/location/${resource.id}/edit`)
    } else {
      console.error('PassportLocationsIndex: There is no resource id')
    }
  }

  const renderResourceFields = (resource) => (
    <>
      <td>{ capitalize(resource['location-type']) }</td>
      <td>{ resource['active'] ? 'Yes' : 'No' }</td>
    </>
  )

  const renderSubHeading = () => (
    <tr className="cms-table__row--bold" key={'sub-heading'}>
      <td>Name</td>
      <td>Type</td>
      <td>Active</td>
      <td></td>
    </tr>
  )

  const renderResources = (props, tableHeading) => {
    const {
      resourceName,
      renderUpdateResource,
      renderDeleteResource,
      renderSubHeading = () => null,
      renderResourceFields = () => null,
    } = props
    const subHeading = renderSubHeading()
    const resourceItems = (props.resources || []).sort((a, b) => a.position - b.position).map((resource, i) => {
      return (
        <Resource key={ resource.id }
          name={ resource.name }
          fields={() => renderResourceFields(resource)}
        >
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" onClick={() => { renderUpdateResource(resource, props) }} />
            <ActionMenuItem label="Delete" onClick={() => { renderDeleteResource(resource, props) }} />
          </ActionMenu>
        </Resource>
      )
    })
    let defaultHeading = resourceItems.length === 0 ? null : (
      <thead>
        <tr>
          <th colSpan="2">Name</th>
        </tr>
      </thead>
    )
    return (
      <div className="container">
        <table className="cms-table">
          { tableHeading ? tableHeading : defaultHeading }
          <tbody>
            { (resourceItems.length > 0 && subHeading) ? subHeading : null }
            { resourceItems.length > 0 ? resourceItems : null }
          </tbody>
        </table>
        { resourceItems.length === 0 && (
            <div className="panel u-align-center">
              <p>There are currently no {pluralize(resourceName)}, try creating some!</p>
            </div>
        )}
      </div>
    )
  }

  const renderCreateResource = () => {
    props.history.push(`/admin/${Localisation.passport.market.path}/${props.marketId}/location/new`)
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    resourceName: Localisation.passport.location.upper,
    renderResources,
    renderCreateResource,
    renderUpdateResource,
    renderResourceFields,
    renderSubHeading,
    deleteWarningMsg: 'All Hotels/Restaurants attached to the location will be lost',
  }

  return props.renderTableIndex(indexHelperProps, 3)
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withIndexHelper,
  withHooks(props => {
    const { marketId } = props.match.params
    const marketRelation = props.showAll ? undefined : {
      'name': 'passport-market',
      'id': marketId
    }
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/locations', marketRelation))
    const [deleteError, setDeleteError] = useState(null)

    let query = {
      fields: {
        'passport-locations': 'active,address,latitude,location-type,longitude,name'
      }
    }

    if (props.showAll) {
      query = deepmerge.concat(query, {
        include: 'markets',
        fields: {
          'passport-locations': 'markets',
          'passport-markets': 'id'
        }
      })
    }

    useEffect(() => {
      if (props.showAll) {
        locationsReduxResource.findAll(query)
      } else if (marketId) {
        locationsReduxResource.findAllFromOneRelation(marketRelation, query)
      }
    }, [])

    useWatchForTruthy(locationsReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    useWatchForTruthy(locationsReduxResource.mutationState.errored, () => {
      setDeleteError(locationsReduxResource.mutationState.errors)
    })

    return {
      ...props,
      marketId,
      deleteError,
      deleteResource: locationsReduxResource.deleteResource,
      resources: locationsReduxResource.getReduxResources()
    }
  })
)

export default enhance(PassportLocationsIndex)
