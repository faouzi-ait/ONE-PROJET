import React, { useEffect, useState } from 'react'
import moment from 'moment'

import allClientVariables from './variables'
import contentBlockClientVariables from 'javascript/views/admin/pages/content-blocks/variables'

import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

// Components
import AdminToolbar from 'javascript/components/admin-toolbar'
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Blocks from 'javascript/views/blocks'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ListModal from 'javascript/components/list-modal'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import Sharer from 'javascript/components/sharer'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'

import { UserType } from 'javascript/types/ModelTypes'
import { RouteComponentProps } from 'react-router'

interface MatchParams {
  slug: string
}
interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType {
  user: UserType
}

const NewsArticle: React.FC<Props> = ({
  match,
  pageIsLoading,
  modalState,
  user,
}) => {
  const newsArticleResource = useResource('news-article')
  const [newsArticle, setNewsArticle] = useState(null)

  const theme = useTheme()
  const { features, variables } = theme
  const newsArticleCV = useClientVariables(allClientVariables)
  const contentBlocksCV = useClientVariables(contentBlockClientVariables)

  const getNewsArticle = () => {
    newsArticleResource.findAll({
      include: 'meta-datum,page-images',
      fields: {
        'news-articles': 'title,introduction,slug,publish-date,content-blocks,banner-urls,page-images,enable-sharing,meta-datum',
        'meta-data': 'title,keywords,description',
        'page-images': 'file'
      },
      'filter[slug]': match.params.slug
    })
    .then((response) => {
      setNewsArticle(response[0] || null)
      pageIsLoading(false)
    })
  }

  useEffect(() => {
    getNewsArticle()
  }, [])


  const addToList = (resources) => () => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal delay={500} customContent={true} modifiers={['custom-content']}>
          <ListModal resourcesToAddToList={resources} closeEvent={hideModal} user={user} />
        </Modal>
      )
    })
    return false
  }

  if (!newsArticle) return null

  const meta = newsArticle['meta-datum']
  return (
    <Meta
      title={meta?.title || newsArticle.title}
      meta={{
        description: meta?.description || '',
        keywords: meta?.keywords || '',
      }}>

      <main>
        <div className="fade-on-load">

          <Banner
            image={getBannerImageUrls(newsArticle)}
            title={newsArticleCV.bannerTitle(variables.SystemPages.news.upper)}
            classes={newsArticleCV.bannerClasses}
          />

          <Breadcrumbs paths={[{
            name: variables.SystemPages.news.upper,
            url: `/${variables.SystemPages.news.path}`
          }, {
            name: newsArticle.title,
            url: `${variables.SystemPages.news.path}/${newsArticle.slug}`
          }]} classes={['bordered']} />


          <section className={newsArticleCV.sectionClasses}>
            <div className="container">
              <p className="news__date">
                {newsArticle['publish-date'] && moment(newsArticle['publish-date']).utc().format(features.formats.longDate)}
              </p>
              <h1 className="section__header">{newsArticle.title}</h1>
              {newsArticle.introduction &&
                <p className="section__copy">{newsArticle.introduction}</p>
              }
            </div>
          </section>


          {newsArticle['content-blocks'].map((block) => (
            <ShouldRenderContentBlock
              block={block}
              renderBlock={() => {
                const bgImage = block.bgImage ? newsArticle['page-images'].find(i => i.id === block.bgImage.id) : null
                return (
                  <section key={block.id}
                    className={contentBlocksCV.sectionClasses((block))}
                    style={block.background === 'image' && bgImage ? {
                      backgroundImage: `url(${bgImage.file.url.replace('.net/', `.net/${contentBlocksCV.backgroundSize}/`)})`,
                      backgroundSize: contentBlocksCV.backgroundCover
                    } : null}
                  >
                    <ClientChoice>
                      <ClientSpecific client="default">
                        <div className={(block.type !== 'html-markup' && block.type !== 'banner-carousel'
                            && block.type !== 'promo-carousel' && (block.type !== 'related-pages')
                            && (block.type !== 'banner-scroller'))
                            ? 'container' : 'content-block__inner'}>
                            {Blocks(block, { 'page-images': newsArticle['page-images'] }, {
                            user: user,
                            addToList: addToList,
                          })}
                      </div>
                      </ClientSpecific>
                      <ClientSpecific client="amc | drg">
                        <div className={ (block.type !== 'html-markup' && block.type !== 'banner-carousel'
                                        && block.type !== 'promo-carousel' && block.type !== 'production-companies'
                                        && block.type !== 'related-pages')
                                        ? 'container' : 'content-block__inner' }>
                                        {Blocks(block, { 'page-images': newsArticle['page-images'] }, {
                            user: user,
                            addToList: addToList,
                          })}
                        </div>
                      </ClientSpecific>
                    </ClientChoice>
                  </section>
                )
              }}
            />
          ))}

          {newsArticle['enable-sharing'] &&
            <Sharer title={newsArticle.title} />
          }
        </div>
        <AdminToolbar type={'news'} id={newsArticle.slug} user={user} />
      </main>
    </Meta>
  )
}

export default withPageHelper(NewsArticle)
