import React, { useState, useEffect } from 'react'

import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

// Components
import ContentBlocks from 'javascript/views/admin/pages/content-blocks'

interface Props extends WithPageHelperType {
  match: any
}

const NewsEditContentBlocks: React.FC<Props> = ({
  match,
  pageIsLoading,
  modalState
}) => {

  const usedImageIdState = useUsedImageIdState()
  const newsArticleResource = useResource('news-article')
  const { slug } = match.params

  const [resource, setResource] = useState(null)

  useEffect(() => {
    getNewsArticles()
  }, [slug])

  const getNewsArticles = () => {
    newsArticleResource.findAll({
      include: 'page-images',
      fields: {
        'news-articles': 'title,slug,content-blocks,page-images'
      },
      filter: {
        slug
      }
    })
    .then((response) => {
      const article = response.find((t) => t.slug === slug)
      setResource(article)
      usedImageIdState.setUsedImageIds({
        type: 'news',
        resourceId: article.id,
        contentBlocks: article['content-blocks']
      })
      pageIsLoading(false)
      modalState.hideModal()
    })
  }

  const updateResource = (updatedResource) => {
    newsArticleResource.updateResource(updatedResource)
    .then((response) => {
      getNewsArticles()
    })
  }

  return (
    <main>
      <ContentBlocks
        resource={resource}
        blockLocation={'news'}
        updateResource={updateResource}
      />
    </main>
  )
}

const enhance = compose(
  withPageHelper,
)

export default enhance(NewsEditContentBlocks)
