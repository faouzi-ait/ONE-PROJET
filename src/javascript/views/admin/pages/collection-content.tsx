import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

// Components
import ContentBlocks from 'javascript/views/admin/pages/content-blocks'
import { RouteComponentProps } from 'react-router'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

interface Match {
  collectionId
}

interface Props extends WithPageHelperType, RouteComponentProps<Match> {}

const CollectionContentBlocks: React.FC<Props> = ({
  match,
  modalState,
  pageIsLoading,
}) => {

  const { collectionId } = match.params
  const collectionResource = useResource('collection')

  const getCollection = () => {
    collectionResource.findOne(collectionId, {
      include: 'page-images',
      fields: {
        collections: 'title,content-blocks,page-images',
        'page-images': 'file'
      }
    }).then((response) => {
      pageIsLoading(false)
      modalState.hideModal()
    })
  }

  useEffect(() => {
    getCollection()
  }, [])

  useWatchForTruthy(collectionResource.mutationState.succeeded, () => {
    getCollection()
  })

  return (
    <main>
      <ContentBlocks
        resource={collectionResource.getDataById(collectionId)}
        blockLocation={'collection'}
        updateResource={collectionResource.updateResource}
        includeContentPlaceholder={true}
      />
    </main>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(CollectionContentBlocks)
