import React, { useEffect, useState } from 'react'

import useResource from 'javascript/utils/hooks/use-resource'
// Components
import MetaDataForm from 'javascript/components/admin/metadata-form'
// Types
import { CatalogueType } from 'javascript/types/ModelTypes'

interface Props {
  customCatalogue: Partial<CatalogueType>
  closeEvent: () => void
}

const CataloguesMetaData: React.FC<Props> = ({
  customCatalogue,
  closeEvent
}) => {
  const metaDatumResource = useResource('meta-datum')
  const [metaResource, setMetaResource] = useState(null)

  useEffect(() => {
    if (customCatalogue.id) {
      const customCatalogueRelation = {
        'name': 'catalogue',
        'id': customCatalogue.id
      }
      metaDatumResource.findOneFromOneRelation(customCatalogueRelation, {
        fields: {
          'meta-datums': 'title,keywords,description'
        }
      })
      .then((response) => {
        if (response) {
          setMetaResource({
            'id': response.id,
            'description': response.description,
            'keywords': response.keywords,
            'title': response.title,
          })
        }
      })
    }
  }, [customCatalogue])

  const handleSubmit = (meta) => {
    const update = {
      ...(metaResource || {}),
      ...meta
    }
    if (!metaResource) {
      update['catalogue'] = {
        id: customCatalogue.id
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
      intitialTitle={customCatalogue.name}
      resource={metaResource}
      onSubmit={handleSubmit}
    />
  )
}

export default CataloguesMetaData
