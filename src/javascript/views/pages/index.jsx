import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'

// Views
import Collection from 'javascript/views/pages/collection/index'
import Page from 'javascript/views/pages/page/index'
import NotFoundComponent from 'javascript/components/not-found'

// Helper Functions
import extractPageImageIds from 'javascript/utils/helper-functions/extract-page-image-ids'

// Hooks
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'

const PagesIndex = (props) => {
  if (props.pageState.isLoading || !props.resource) {
    return null
  }
  const { systemPages } = useSystemPages()
  const pageType = systemPages.includesSlugAndEnabledFeature(props.resource.slug)
  const isViewablePage = systemPages.isViewablePage(props.resource.slug)
  let View = props.viewType === 'collection' ? Collection : props.viewType === 'page' ? Page : NotFoundComponent
  if (!pageType.enabled || !isViewablePage) {
    View = NotFoundComponent
  }
  return (
    <View resource={props.resource} location={props.location} user={props.user} />
  )
}

const enhance = compose(
  withLoader,
  withHooks((props) => {

    const { parent } = props.match.params

    const [viewType, setViewType] = useState('')
    const [resource, setResource] = useState(null)

    const pagesReduxResource = useReduxResource('pages', 'pages_index/pages')
    const pageImagesReduxResource = useReduxResource('page-images', 'pages_index/page-images')
    const collectionReduxResource = useReduxResource('collections', 'pages_index/collection')

    useEffect(() => {
      if (parent === props.theme.variables.SystemPages.home.path) {
        return pageError('Page not allowed')
      }
      if ((resource && parent !== resource?.slug) || !resource) {
        props.pageIsLoading(true)
      }
      checkForCollection(parent)
    }, [parent])

    const checkForCollection = (slug) => {
      collectionReduxResource.findAll({
        include: 'meta-datum,page-images',
        fields: {
          'collections': 'slug,title,introduction,banner-urls,sortable,shareable,banner-text-color,meta-datum,default-order,content-blocks,page-images',
          'page-images': 'file'
        },
        filter: {
          slug
        }
      })
      .then((response) => {
        if (response.length) {
          setViewType('collection')
          props.pageIsLoading(false)
          setResource(response[0])
        } else {
          checkForPage(parent)
        }
      })
      .catch(pageError)
    }

    const pageError = (error) => {
      console.error('page error (a1):', error)
      props.pageReceivedError(true) // will display <NotFoundComponent>
    }

    const checkForPage = (slug) => {
      const params = {
        include: 'collection,meta-datum',
        fields: {
          'pages': 'slug,title,introduction,banner-urls,published-at,collection,content-blocks,banner-text-color,meta-datum,shareable,redirect-url',
          'collections': 'slug,title',
          'meta-datums': 'title,keywords,description'
        },
        filter: {
          slug
        }
      }
      pagesReduxResource.findAll(params)
      .then((response) => {
        if (response.length) {
          const redirectUrl = response[0]?.['redirect-url']
          if(redirectUrl){
            window.location.href = redirectUrl
          }
          setViewType('page')
          setResource(response[0])
        } else {
          pageError('Pages data not complete')
        }
      })
      .catch(pageError)
    }

    useEffect(() => {
      if (resource && resource.type === 'pages' && !resource['page-images']) {
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
          'page-images': response
        })
        props.pageIsLoading(false)
      })
      .catch(pageError)
    }

    return {
      ...props,
      resource,
      viewType,
    }
  })
)

export default enhance(PagesIndex)