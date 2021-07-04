import React, { useEffect, useState } from 'react'

import { Localisation } from 'javascript/config/features'
import compose from 'javascript/utils/compose'

// Components
import DeleteForm from 'javascript/views/admin/programme-types/delete-form'
import Modal from 'javascript/components/modal'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'

export const removeBlacklistedResourceKeys = (resource) => {
  const blacklist = ['users-count', 'programmes-count']
  const update = { ...resource }
  blacklist.forEach((key) => delete update[key])
  return update
}

const ProgrammeTypesIndex = (props) => {

  const { theme } = props

  const resourceName = theme.localisation.programmeType.upper

  const meta = {
    title: `${Localisation.client} :: ${theme.localisation.programmeType.upper}`,
    meta: {
      description: `Edit and Create ${theme.localisation.programmeType.upper}`
    }
  }
  const programmeTypesResource = useResource('programme-type')

  const [pageNumber, setPageNumber] = useState(1)

  const getProgrammeTypes = () => {
    programmeTypesResource.findAll({
      fields: {
        'programme-types': 'name,programmes-count,users-count',
      },
      'page[number]': pageNumber,
      'page[size]': 20,
      sort: 'position'
    })
  }

  useEffect(() => {
    getProgrammeTypes()
  }, [pageNumber])


  useWatchForTruthy(programmeTypesResource.mutationState.succeeded, () => {
    getProgrammeTypes()
    props.modalState.hideModal()
  })

  const renderDeleteResource = (resource, props) => {
    const userCount = resource['users-count']
    const programmeCount = resource['programmes-count']
    if (userCount === 0 && programmeCount === 0) {
      return programmeTypesResource.deleteResource(resource)
    }
    props.modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm {...props}
              resource={ resource }
              closeEvent={ hideModal }
              deleteResource={programmeTypesResource.deleteResource}
            />
          </div>
        </Modal>
      )
    })
  }

  const resources = programmeTypesResource.getDataAsArray()

  const withPaginator = {
    pageNumber,
    totalPages: resources?.meta['page-count'],
    updatePageNumber: setPageNumber
  }

  const updateResource = (resource) => {
    const update = removeBlacklistedResourceKeys(resource)
    programmeTypesResource.updateResource(update)
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    createResource: programmeTypesResource.createResource,
    meta,
    renderDeleteResource,
    resourceName,
    resources,
    updateResource,
    withPaginator,
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withModalRenderer,
  withIndexHelper,
)

export default enhance(ProgrammeTypesIndex)