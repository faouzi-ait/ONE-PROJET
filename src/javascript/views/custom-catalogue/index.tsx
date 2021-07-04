import React, { useEffect, useState } from 'react'

import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import withLoader from 'javascript/components/hoc/with-loader'

import { CatalogueIndex } from 'javascript/views/catalogue/index'

import { RouteComponentProps } from 'react-router'
import { CatalogueType } from 'javascript/types/ModelTypes'

interface MatchParams {
  catalogueSlug
}

interface Props extends RouteComponentProps<MatchParams> {
  pageIsLoading: (state?: any) => void | boolean
  pageReceivedError: (error: any) => void
}

const CustomCatalogueIndex: React.FC<Props> = (props) => {
  const {
    match,
    pageIsLoading,
    pageReceivedError,
  } = props
  const { catalogueSlug } = match.params
  const [customCatalogue, setCustomCatalogue] = useState<CatalogueType>({} as CatalogueType)
  const catalogueResource = useResource('catalogue')
  const { localisation } = useTheme()

  useEffect(() => {
    getCatalogue()
  }, [match.params.catalogueSlug])

  const getCatalogue = () => {
    catalogueResource.findAll({
      include: 'meta-datum',
      fields: {
        'catalogues': 'name,slug,banner-urls,content-blocks,meta-datum',
        'meta-data': 'title,description,keywords'
      },
      'filter[slug]': catalogueSlug
    })
    .then((response) => {
      const catalogue = response.find((c) => c.slug === catalogueSlug)
      if (catalogue) {
        pageIsLoading(false)
        setCustomCatalogue(catalogue)
      } else {
        pageReceivedError(`:: path not registered : ${catalogueSlug}`)
      }
    })
  }

  const metaDatum =  {
    title: `${localisation.client} :: ${localisation.catalogue.upper}`,
    meta: {
      description: customCatalogue['meta-datum']?.description || `${customCatalogue.name} contains a sub selection of ${localisation.catalogue.upper}`,
      keywords: customCatalogue['meta-datum']?.keywords || `${customCatalogue.name}`,
    }
  }

  return !Object.keys(customCatalogue).length ? null : (
    <CatalogueIndex {...props}
      bannerUrls={customCatalogue['banner-urls']?.default && customCatalogue['banner-urls']}
      contentBlocks={customCatalogue['content-blocks'] || []}
      pageImages={customCatalogue['page-images'] || []}
      meta={metaDatum}
      catalogueTitle={customCatalogue.name}
      cataloguePath={`custom-${localisation.catalogue.path}/${customCatalogue.slug}`}
      catalogueFilter={customCatalogue.id}
      bannerVariant={'default'}
    />
  )
}

export default withLoader(CustomCatalogueIndex)
