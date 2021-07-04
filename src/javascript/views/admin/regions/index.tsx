import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'

// Components
import DeleteForm from 'javascript/views/admin/regions/delete'
import Modal from 'javascript/components/modal'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'

const RegionsIndex = (props) => {
  const { theme } = props
  const meta = {
    title: `${theme.localisation.client} :: ${theme.localisation.region.upper}`,
    meta: {
      description: `Edit and Create ${theme.localisation.region.lower}`
    }
  }

  const regionsResource = useResource('region')
  const [pageNumber, setPageNumber] = useState(1)

  const getRegions = () => {
    const request = {
      fields: {
        'regions': 'name,users-count',
      },
      'page[number]': pageNumber,
      'page[size]': 20,
      sort: 'name'
    }
    regionsResource.findAll(request)
  }

  useEffect(() => {
    getRegions()
  }, [pageNumber])

  useWatchForTruthy(regionsResource.mutationState.succeeded, () => {
    getRegions()
    props.modalState.hideModal()
  })

  const renderDeleteResource = (resource, props) => {
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm {...props}
              region={resource}
              closeEvent={ hideModal }
              deleteResource={regionsResource.deleteResource}
            />
          </div>
        </Modal>
      )
    })
  }

  const resources = regionsResource.getDataAsArray()

  const withPaginator = {
    pageNumber,
    totalPages: resources?.meta['page-count'],
    updatePageNumber: setPageNumber
  }

  const updateResource = (resource) => {
    const update = {...resource}
    delete update['users-count']
    regionsResource.updateResource(update)
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    createResource: regionsResource.createResource,
    meta,
    renderDeleteResource,
    resourceName: theme.localisation.region.upper,
    resources,
    updateResource,
    withPaginator,
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withIndexHelper,
)

export default enhance(RegionsIndex)
