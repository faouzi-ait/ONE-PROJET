import React, {useState, useEffect} from 'react'
import { RouteComponentProps, withRouter } from 'react-router';
import Blocks from 'javascript/views/blocks'
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Sharer from 'javascript/components/sharer'
import moment from 'moment'
import Meta from 'react-document-meta'
import ListModal from 'javascript/components/list-modal'
import Modal from 'javascript/components/modal'
import AdminToolbar from 'javascript/components/admin-toolbar'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'

import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import contentBlockClientVariables from 'javascript/views/admin/pages/content-blocks/variables'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'

import pageClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

// Types
import { PageType } from 'javascript/types/ModelTypes'
import { WithUserType } from 'javascript/components/hoc/with-user';

interface Props extends RouteComponentProps, WithUserType, WithThemeType, WithModalType {
  contentBlocksCV: any
  pageCV: any,
  resource: PageType,
}

const PageView: React.FC<Props> = ({
    modalState,
    theme,
    user,
    contentBlocksCV,
    pageCV,
    resource
  }) => {

  const [meta, setMeta] = useState({
    title: null,
    description: '',
    keywords: ''
  })

  useEffect(() => {
    if (resource) {
      setMeta(resource['meta-datum'])
    }
    if(!resource['content-blocks']?.length && pageCV.forceRedirect && location.search !== '?reload'){
      window.location.href = location.href + "?reload";
    }
  }, [resource])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [contentBlocksCV])

  const addToList = (resources) => () => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal delay={500} customContent={true} modifiers={['custom-content']} closeEvent={hideModal}>
          <ListModal resourcesToAddToList={resources} closeEvent={hideModal} user={user} />
        </Modal>
      )
    })
    return false
  }

  const extendedCV = useClientVariables(pageClientVariables, {
    bannerCopy: {
      default: pageCV.showIntro ? resource['published-at'] && moment(resource['published-at']).format(theme.features.formats.longDate) : resource.introduction
    },
    pageClasses: {
      default: null,
      'ae': resource?.collection?.title.replace(/[^A-Z0-9]+/ig, "_").toLowerCase() || null
    }
  })

  return (
    <Meta
      title={meta?.title ||
        `${theme.localisation.client} :: ${resource.title}`}
      meta={{
        description: meta?.description || '',
        keywords: meta?.keywords || '',
        property: {
          'og:title': theme.localisation.client,
          'og:image': `${window.location.origin}/assets/images/programme-placeholder-retina.jpg`
        }
      }}>

      <main className={extendedCV.pageClasses}>
        <div className="fade-on-load">

          <Banner textColor={resource['banner-text-color'] || null}
            title={resource.title}
            image={getBannerImageUrls(resource)}
            copy={extendedCV.bannerCopy}
            classes={pageCV.bannerClasses}
            variant={pageCV.bannerVariant}
          />

          { resource.collection ? (
            <Breadcrumbs paths={[{
              name: resource.collection.title,
              url: `/${resource.collection.slug}`
            }, {
              name: resource.title,
              url: `${resource.collection.slug}/${resource.slug}`
            }]} classes={pageCV.breadcrumbClasses} />
          ) : (
              <Breadcrumbs paths={[{
                name: resource.title,
                url: `/${resource.slug}`
              }]} classes={pageCV.breadcrumbClasses} />
            )}

          {pageCV.showIntro && resource.introduction &&
            <section className="section">
              <div className="container section__header">
                <p className="section__copy">{resource.introduction}</p>
              </div>
            </section>
          }

          {(resource['content-blocks'] || []).map((block) => (
            <ShouldRenderContentBlock
              block={block}
              renderBlock={() => {
                const bgImage = block.bgImage ? resource['page-images'].find(i => i.id === block.bgImage.id) : null
                return (
                  <section key={block.id}
                    className={contentBlocksCV.sectionClasses((block))}
                    style={block.background === 'image' && bgImage ? {
                      backgroundImage: `url(${bgImage.file.url.replace('.net/', `.net/${contentBlocksCV.backgroundSize}/`)})`,
                      backgroundSize: contentBlocksCV.backgroundCover
                    } : null}
                  >
                    <div className={!contentBlocksCV.blocksWithoutContainers.includes(block.type)? 'container' : 'content-block__inner' }>
                      {Blocks(block, { 'page-images': resource['page-images'] }, {
                        user: user,
                        addToList: addToList,
                      })}
                    </div>

                  </section>
                )
              }}
            />
          ))}

          {resource.shareable &&
            <Sharer title={resource.title} />
          }
        </div>
        <AdminToolbar type={'page'} id={resource.id} user={user} />
      </main>
    </Meta>
  )
}

const enhance = compose(
  withModalRenderer,
  withRouter,
  withTheme,
  withClientVariables('pageCV', pageClientVariables),
  withClientVariables('contentBlocksCV', contentBlockClientVariables)
)

export default enhance(PageView)