import React, { useState, useEffect } from 'react'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

// Components
import ContentBlocks from 'javascript/views/admin/pages/content-blocks'
import { RouteComponentProps } from 'react-router'

interface MatchParams {
  catalogueId: string
}

interface Props extends WithPageHelperType, RouteComponentProps<MatchParams> {}

const CustomCataloguesContent: React.FC<Props> = ({
  match,
  pageIsLoading,
  modalState,
}) => {

  const usedImageIdState = useUsedImageIdState()
  const catalogueResource = useResource('catalogue')
  const { catalogueId } = match.params
  const [resource, setResource] = useState(null)

  useEffect(() => {
    getCatalogues()
  }, [catalogueId])

  const getCatalogues = () => {
    catalogueResource.findOne(catalogueId, {
      include: 'page-images',
      fields: {
        'catalogues': 'name,slug,content-blocks,page-images'
      }
    })
    .then((response) => {
      if (!response) return
      setResource(response)
      usedImageIdState.setUsedImageIds({
        type: 'customCatalogue',
        resourceId: response.id,
        contentBlocks: response['content-blocks']
      })
      pageIsLoading(false)
      modalState.hideModal()
    })
  }

  const updateResource = (updatedResource) => {
    catalogueResource.updateResource(updatedResource)
    .then((response) => {
      getCatalogues()
    })
  }

  if (!resource) return null
  return (
    <main>
      <ContentBlocks
        resource={resource}
        blockLocation={'customCatalogue'}
        updateResource={updateResource}
        includeContentPlaceholder={true}
      />
    </main>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(CustomCataloguesContent)
