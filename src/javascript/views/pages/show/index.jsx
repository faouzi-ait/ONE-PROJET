import React, { useEffect, useState } from 'react'
import deepmerge from 'deepmerge-concat'
import compose from 'javascript/utils/compose'

// Components
import Page from 'javascript/views/pages/page/index'

// Helper Functions
import extractPageImageIds from 'javascript/utils/helper-functions/extract-page-image-ids'

import allClientVariables from './variables'

// Hooks
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'

const PageShow = (props) => {
  if (props.pageState.isLoading || !props.resource['page-images']) {
    return null
  }
  return <Page resource={props.resource} user={props.user} />

}

const enhance = compose(
  withLoader,
  withHooks((props) => {
    const showCV = useClientVariables(allClientVariables)
    const { parent, slug } = props.match.params
    const [resource, setResource] = useState(null)

    const pagesReduxResource = useReduxResource('pages', 'pages_show/pages')
    const pageImagesReduxResource = useReduxResource('page-images', 'pages_show/page-images')

    useEffect(() => {
      let query = {
        include: 'collection',
        fields: {
          'pages': 'slug,title,introduction,banner-urls,published-at,collection,content-blocks,banner-text-color,shareable,redirect-url',
          'collections': 'title,slug',
        },
        filter: {
          slug,
          'collection-slug': parent
        }
      }
      if (showCV.includeMetaData) {
        query = deepmerge.concat(query, {
          include: 'meta-datum',
          fields: {
            pages: 'meta-datum',
            'meta-datums': 'title,keywords,description',
          },
        })
      }
      pagesReduxResource.findAll(query)
      .then((response) => {
        if (response.length) {
          const redirectUrl = response[0]?.['redirect-url']
          if(redirectUrl){
            window.location.href = redirectUrl
          }
          setResource(response[0])
        } else {
          pageError('Page not found')
        }
      })
      .catch(pageError)
    }, [slug])

    useEffect(() => {
      if (resource && !resource['page-images']) {
        fetchAllPageImages(resource)
      }
    }, [resource])

    const fetchAllPageImages = (page) => {
      const pageImageIds = extractPageImageIds(page['content-blocks']) || []
      const relation = {
        id: page.id,
        name: 'pages'
      }
      pageImagesReduxResource.findAllFromOneRelation(relation, {
        filter: {
          id: pageImageIds.join(','),
        },
      })
      .then((response) => {
        setResource({
          ...resource,
          'page-images': response || []
        })
        props.pageIsLoading(false)
      })
      .catch(pageError)
    }

    const pageError = (error) => {
      console.error('page error (a2):', error)
      props.pageReceivedError(true) // will display <NotFoundComponent>
    }

    return {
      ...props,
      resource,
    }
  })
)

export default enhance(PageShow)