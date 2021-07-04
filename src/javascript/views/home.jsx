import React, { useEffect } from 'react'
import Meta from 'react-document-meta'

import compose from 'javascript/utils/compose'

import extractPageImageIds from 'javascript/utils/helper-functions/extract-page-image-ids'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import contentBlockVariables from 'javascript/views/admin/pages/content-blocks/variables'
import useApi from 'javascript/utils/hooks/use-api'
import useResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'

// Components
import AdminToolbar from 'javascript/components/admin-toolbar'
import Blocks from 'javascript/views/blocks'
import ListModal from 'javascript/components/list-modal'
import Modal from 'javascript/components/modal'
import PageLoader from 'javascript/components/page-loader'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'
import { notifyBugsnag } from 'javascript/utils/helper-functions/notify-bugsnag'

const HomePage = ({ user, modalState, theme, contentBlocksCV }) => {
  if (theme.variables.SystemPages) {
    const missingSystemPages = []
    Object.keys(theme.variables.SystemPages).forEach((key) => {
      if (!theme.variables.SystemPages[key]?.id) {
        missingSystemPages.push(key)
      }
    })
  }
  const addToList = (resources) => () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        delay={500}
        customContent={true}
        closeEvent={hideModal}
        modifiers={['custom-content']}
      >
        <ListModal resourcesToAddToList={resources} closeEvent={hideModal} user={user} />
      </Modal>
    ))
    return false
  }
  let slug = theme.variables.SystemPages.home.lower

  if (theme.variables.KidsVersion && window.location.hostname.includes('kids')) {
    slug = 'kids'
  }

  const { resource = {}, loaded, errored, pageImages } = useData(slug)

  return (
    <Meta
      title={
        (resource['meta-datum'] && resource['meta-datum'].title) ||
        `${theme.localisation.client} :: Home`
      }
      meta={{
        description:
          (resource['meta-datum'] && resource['meta-datum'].description) || '',
        keywords:
          (resource['meta-datum'] && resource['meta-datum'].keywords) || '',
          property: {
            'og:title': theme.localisation.client,
            'og:image': `${window.location.origin}/assets/images/programme-placeholder-retina.jpg`
          }
      }}
    >
      <PageLoader {...{ loaded, errored }}>
        <main>
          <div className="fade-on-load">
            {(resource['content-blocks'] || []).map(block => (
              <ShouldRenderContentBlock
                block={block}
                renderBlock={() => {
                  const bgImage = block.bgImage ? (pageImages || []).find(i => i.id === block.bgImage.id) : null
                  return (
                    <>
                      <section key={block.id}
                        className={contentBlocksCV.sectionClasses((block))}
                        style={block.background === 'image' && bgImage ? {
                            backgroundImage: `url(${bgImage.file.url.replace('.net/', `.net/${contentBlocksCV.backgroundSize}/`)})`,
                          } : null
                        }
                      >
                        <div className={!contentBlocksCV.blocksWithoutContainers.includes(block.type)? 'container' : 'content-block__inner' }>
                          {Blocks(block, {
                            'page-images': pageImages || [] }, {
                            user: user,
                            addToList: addToList,
                          })}
                        </div>
                      </section>
                    </>
                  )
                }}
              />
            ))}
          </div>
          <AdminToolbar type={'page'} id={resource.id} user={user} />
        </main>
      </PageLoader>
    </Meta>
  )
}

const enhance = compose(
  withModalRenderer,
  withClientVariables('contentBlocksCV', contentBlockVariables),
)

export default enhance(HomePage)

const useData = (slug) => {

  const getResourceFromData = resources => {
    let resource = resources.filter(
      page => page.title.toLowerCase() === slug,
    )[0]
    return resource
  }

  const pagesResource = useResource('pages', 'pages__homePage')
  const [pageImagesState, fetchPageImages] = useApi(
    api => ({ pageId, pageImageIds }) => {
      return api.request(`${api.apiUrl}/pages/${pageId}/page-images`, 'GET', {
        filter: {
          id: pageImageIds.join(','),
        },
      })
    },
  )

  useEffect(() => {
    document.body.scrollTop = document.documentElement.scrollTop = 0
    if (!pagesResource.queryState.data) {
      pagesResource.findAll({
        include: 'meta-datum',
        filter: {
          slug
        },
        fields: {
          pages: 'title,content-blocks,meta-datum',
          'meta-datums': 'title,keywords,description',
        }
      })
    }
  }, [])

  const page = getResourceFromData(pagesResource.queryState.data || [])

  useWatchForTruthy(pagesResource.queryState.succeeded, () => {
    if (page) {
      const pageImageIds = extractPageImageIds(page['content-blocks'])
      fetchPageImages({ pageId: page.id, pageImageIds })
    }
  })

  return {
    loaded:
      pagesResource.queryState.succeeded &&
      (pageImagesState.status === 'fulfilled' || page === undefined),
    errored:
      pagesResource.queryState.errored ||
      pageImagesState.status === 'errored',
    resource: page,
    pageImages: pageImagesState.data || [],
  }
}

