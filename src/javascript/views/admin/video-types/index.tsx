import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'

// Components
import DeleteForm from 'javascript/components/admin/delete-form-confirm'
import Modal from 'javascript/components/modal'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { RouteComponentProps, withRouter } from 'react-router-dom'
import withIndexHelper, { WithIndexHelperType } from 'javascript/components/hoc/with-index-helper'
import { WithThemeType } from 'javascript/utils/theme/withTheme'
import { WithUserType } from 'javascript/components/hoc/with-user'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

interface Props extends RouteComponentProps, WithPageHelperType, WithThemeType, WithUserType, WithIndexHelperType {}

const VideoTypesIndex: React.FC<Props> = (props) => {
  const {
    modalState,
    pageIsLoading,
    renderPageIndex,
    theme: { localisation },
  } = props

  const meta = {
    title: `${localisation.client} :: ${localisation.video.upper} types`,
    meta: {
      description: `Edit and create ${localisation.video.upper} types`
    }
  }
  const videoTypesResource = useResource('video-type')
  const [pageNumber, setPageNumber] = useState(1)

  const getVideoTypes = () => {
    videoTypesResource.findAll({
      fields: {
        'video-types': 'name,videos-count'
      },
      'page[number]': pageNumber,
      'page[size]': 20,
    }).then(() => {
      pageIsLoading(false)
    })
  }

  useEffect(() => {
    getVideoTypes()
  }, [pageNumber])

  useWatchForTruthy(videoTypesResource.mutationState.succeeded, () => {
    getVideoTypes()
    modalState.hideModal()
  })

  const renderDeleteResource = (resource, props) => {
    const videosCount = resource['videos-count']
    if (videosCount === 0) {
      return videoTypesResource.deleteResource(resource)
    }
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm {...props}
              resource={ resource }
              relationName={localisation.video.lower}
              relationCount={videosCount}
              closeEvent={ hideModal }
              deleteResource={videoTypesResource.deleteResource}
            />
          </div>
        </Modal>
      )
    })
  }

  const resources = videoTypesResource.getDataAsArray()

  const withPaginator = {
    pageNumber,
    totalPages: resources?.meta['page-count'],
    updatePageNumber: setPageNumber
  }

  const updateResource = (resource) => {
    const update = {...resource}
    delete update['videos-count']
    videoTypesResource.updateResource(update)
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    createResource: videoTypesResource.createResource,
    meta,
    renderDeleteResource,
    resourceName: `${localisation.video.upper} Type`,
    resources,
    updateResource,
    withPaginator,
  }
  return renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withRouter,
  withPageHelper,
  withIndexHelper,
)

export default enhance(VideoTypesIndex)
