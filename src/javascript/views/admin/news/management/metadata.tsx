import React, { useEffect, useState } from 'react'

import useResource from 'javascript/utils/hooks/use-resource'
// Components
import MetaDataForm from 'javascript/components/admin/metadata-form'
// Types
import { NewsArticleType } from 'javascript/types/ModelTypes'

interface Props {
  newsArticle: Partial<NewsArticleType>
  closeEvent: () => void
}

const NewsMetaData: React.FC<Props> = ({
  newsArticle,
  closeEvent
}) => {
  const metaDatumResource = useResource('meta-datum')
  const [metaResource, setMetaResource] = useState(null)

  useEffect(() => {
    if (newsArticle.id) {
      const newsArticleRelation = {
        'name': 'news-article',
        'id': newsArticle.id
      }
      metaDatumResource.findOneFromOneRelation(newsArticleRelation, {
        fields: {
          'meta-data': 'title,keywords,description'
        }
      })
      .then((response) => {
        setMetaResource({
          'id': response.id,
          'description': response.description,
          'keywords': response.keywords,
          'title': response.title,
        })
      })
    }
  }, [newsArticle])

  const handleSubmit = (meta) => {
    const update = {
      ...(metaResource || {}),
      ...meta
    }
    if (!metaResource) {
      update['news-article'] = {
        id: newsArticle.id
      }
    }
    const saveMeta = metaResource ? metaDatumResource.updateResource : metaDatumResource.createResource
    saveMeta(update)
    .then((response) => {
      closeEvent()
    })
  }

  return (
    <MetaDataForm
      intitialTitle={newsArticle.title}
      resource={metaResource}
      onSubmit={handleSubmit}
    />
  )
}

export default NewsMetaData
