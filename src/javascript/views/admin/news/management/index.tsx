import React, { useEffect, useState } from 'react'
import Meta from 'react-document-meta'
import pluralize from 'pluralize'

import { applyValidFilters } from 'javascript/containers/filters/filter-tools'
import iconClienVariables from 'javascript/components/icon/variables'
import PageStore from 'javascript/stores/pages'

import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import AsyncSearchNewsArticle from 'javascript/components/async-search-news-articles'
import Button from 'javascript/components/button'
import DeleteForm from 'javascript/components/index-helpers/delete-form'
import Icon from 'javascript/components/icon'
import MetaDataForm from 'javascript/views/admin/pages/metadata-form'
import Modal from 'javascript/components/modal'
import NewsArticleFilters from 'javascript/containers/filters/news-article-filter'
import NewsForm from 'javascript/views/admin/news/management/form'
import NewsMetaData from 'javascript/views/admin/news/management/metadata'
import Page from 'javascript/views/admin/pages/page'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Paginator from 'javascript/components/paginator'
import { PageType } from 'javascript/types/ModelTypes'


const initialQuery = {
  include: 'news-article',
  fields: {
    'news-article-search-results': 'introduction-highlight,title-highlight,news-article',
    'news-articles': 'title,featured,status,slug'
  },
}

const initialFilterState = {
  'filter[featured]': null,
  'filter[published-after]': null,
  'filter[published-before]': null,
  'filter[news-category]': null,
  'filter[status]': null,
  'filter[keywords]': '',
  'filter[with-aggregations]': true,
}

interface Props extends WithPageHelperType {
}

const NewsManagement: React.FC<Props> = ({
  pageIsLoading,
  modalState
}) => {

  const newsArticleSearchResource = useResource('news-article-search-result')
  const newsArticleResource = useResource('news-article')
  const pageResource = useResource('page')

  const { localisation, variables } = useTheme()
  const [articles, setArticles] = useState(null)
  const [newsPageResource, setNewsPageResource] = useState<Partial<PageType>>({})

  const [selectedNewsArticle, setSelectedNewsArticle] = useState(null)
  const [filtered, setFiltered] = useState(false)
  const [filterState, setFilterState] = useState(initialFilterState)

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    getNewsArticles()
  }, [filterState, pageSize, pageNumber])

  const getNewsArticles = (articleIds = null) => {
    const query = applyValidFilters(initialQuery, filterState)
    if (articleIds) {
      query['filter[ids]'] = articleIds
    } else {
      query['page[number]'] = pageNumber
      query['page[size]'] = pageSize
    }
    newsArticleSearchResource.findAll(query)
      .then((response) => {
        const update = response.map((result) => {
         return {
           ...result['news-article'],
          }
        })
        update.meta = response.meta
        setTotalPages(response.meta['page-count'])
        setArticles(update)
        pageIsLoading(false)
      })
  }

  useEffect(() => {
    getPageResource()
    PageStore.on('refreshStore', getPageResource)
    return () => {
      PageStore.removeListener('refreshStore', getPageResource)
    }
  }, [])

  useWatchForTruthy(pageResource.mutationState.succeeded, () => {
    modalState.hideModal()
    getPageResource()
  })

  const getPageResource = () => {
    pageResource.findAll({
      fields: {
        'pages': 'title,slug,show-in-nav,show-in-footer,show-in-featured-nav,show-in-mega-nav',
      },
      filter: {
        'page-type': 'news',
      }
    }).then((response) => {
      setNewsPageResource(response[0] || {})
      modalState.hideModal()
    })
  }

  const openFilters = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title="Filter your search"
        titleIcon={{
          id: 'i-filter',
          ...iconClienVariables['i-filter'].default
        }}
        modifiers={['filters', 'xlarge', 'stretch-select']}
      >
        <div className="cms-modal__content">
          <NewsArticleFilters
            query={filterState}
            initialMeta={articles?.meta || {}}
            onSubmit={(filterValues) => {
              setFilterState(filterValues ? filterValues : initialFilterState)
              setFiltered(!!filterValues)
              setPageNumber(1)
            }}
            closeEvent={hideModal}
          />
        </div>
      </Modal>
    ))
  }

  const updatePage = (page, size = false) => {
    if (size) {
      setPageSize(parseInt(page))
      setPageNumber(1)
    } else {
      setPageNumber(parseInt(page))
    }
  }

  const editNewsArticle = (resource = null) => (e) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          modifiers={['large']}
          closeEvent={hideModal}
          title={`${resource ? 'Edit' : 'New'} ${localisation.news.upper} ${localisation.newsArticle.upper}`}
          titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
          <div className="cms-modal__content">
            <NewsForm
              onSubmitted={() => {
                setTimeout(() => {
                  hideModal()
                  getNewsArticles()
                }, 1000)
              }}
              resource={resource}
            />
          </div>
        </Modal>
      )
    })
  }

  const deleteNewsArticle = (newsArticle) => (e) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          closeEvent={ hideModal }
          title="Warning" modifiers={['warning']}
          titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
          <div className="cms-modal__content">
            <DeleteForm
              resource={{
                ...newsArticle,
                name: newsArticle.title
              }}
              closeEvent={ hideModal }
              resourceName={`${localisation.news.upper} ${localisation.newsArticle.upper}`}
              deleteResource={() => {
                newsArticleResource.deleteResource(newsArticle)
                .then((response) => {
                  getNewsArticles()
                  hideModal()
                })
              }}
            />
          </div>
        </Modal>
      )
    })
  }

  const editNewsArticleMetadata = (newsArticle) => (e) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={`${newsArticle.title} Metadata`}
        closeEvent={hideModal}>
        <div className="cms-modal__content">
          <NewsMetaData newsArticle={newsArticle} closeEvent={hideModal} />
        </div>
      </Modal>
    ))
  }

  const renderNewsArticles = () => {
    const resources = (articles || []).map(article => {
      return (
        <tr className="with-action">
          <td>{article.title}</td>
          <td className="label" style={{maxWidth: '40px'}}>
            {article.featured &&
              <span className="count count--warning">Featured</span>
            }
          </td>
          <td className="label" style={{maxWidth: '40px'}}>
            {article.status === 'published' ? (
              <span className="count count--success">Published</span>
            ) : (
              <span className="count count--disabled">Draft</span>
            )}
          </td>
          <td className="cms-table__actions">
            <ActionMenu name="Actions">
              <ActionMenuItem label="Edit" onClick={editNewsArticle(article)} />
              <ActionMenuItem label="Delete" onClick={deleteNewsArticle(article)} />
              <ActionMenuItem label="Manage Meta Data" onClick={editNewsArticleMetadata(article)} />
              <ActionMenuItem label="Manage Content" link={`/admin/${localisation.news.path}/${article.slug}/edit`} divide />
              <ActionMenuItem label="Manage Images" link={`/admin/${localisation.news.path}/${article.slug}/images`} />
              <ActionMenuItem label="View" href={`/${variables.SystemPages.news.path}/${article.slug}`} divide />
            </ActionMenu>
          </td>
        </tr>
      )
    })
    if (resources.length > 0) {
      return (
        < div className = "container" >
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan={3}>{`${localisation.news.upper} ${pluralize(localisation.newsArticle.upper)}`}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resources}
            </tbody>
          </table>
        </div >
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>
              There are currently no {localisation.news.upper} {pluralize(localisation.newsArticle.upper)}, try
              creating some!
            </p>
          </div>
        </div>
      )
    }
  }

  const editNewsPageMetadata = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={`${newsPageResource.title} Metadata`}
        closeEvent={hideModal}>
        <div className="cms-modal__content">
          <MetaDataForm resource={newsPageResource} closeEvent={hideModal} />
        </div>
      </Modal>
    ))
  }

  const editNewsPage = (e) => {
    modalState.showModal(({ hideModal }) => (
      <Modal
        title={localisation.news.upper}
        closeEvent={hideModal}>
        <div className="cms-modal__content">
          <Page resource={newsPageResource} method="updateResource" isStatic={true} />
          {/* <NewsPageForm
            resource={newsPageResource as PageType}
            updateResource={pageResource.updateResource}
          /> */}
        </div>
      </Modal>
    ))
  }

  return (
    <Meta
      title={`${localisation.client} :: ${localisation.news.upper}`}
      meta={{ description: `View ${localisation.news.upper}` }}
    >
      <main>
        <PageHeader title={`Manage ${localisation.news.upper}`}>
          <div className="page-header__actions grid--end grid--center">
            <ActionMenu name="Actions">
              <ActionMenuItem label="Edit" onClick={editNewsPage} />
              <ActionMenuItem label="Manage Banner" link={`/admin/pages/page/${newsPageResource.id}/images`} />
              <ActionMenuItem label="Manage Meta Data" onClick={editNewsPageMetadata} />
              <ActionMenuItem label="View" href={`/${newsPageResource.slug}`} divide />
            </ActionMenu>
            <Button className="button" onClick={editNewsArticle()}>
              <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
              {`New ${localisation.news.upper} ${localisation.newsArticle.upper}`}
            </Button>
          </div>
        </PageHeader>

        <div className="container">
          <div className="page-actions">
            <div className="cms-form__control">
                <AsyncSearchNewsArticle
                  newsArticleFilters={{/* async search does not care about filters - searches all */ }}
                  value={selectedNewsArticle}
                  onChange={(newsArticle) => {
                    setSelectedNewsArticle(newsArticle)
                    getNewsArticles(newsArticle && newsArticle.id || null)
                  }}
                />
            </div>
            { !selectedNewsArticle && (
              <>
                {filtered &&
                  <Button type="button"
                    className="text-button text-button--error page-controls__right"
                    style={{position: 'relative', bottom: '-2px', margin: '0 5px', height: '34px'}}
                    onClick={(e)=> {
                      setFiltered(false)
                      setPageNumber(1)
                      setFilterState(initialFilterState)
                    }}
                  >
                    Clear filters
                  </Button>
                }
                <Button onClick={openFilters} className="button button--filled-bg page-controls__right" style={{height: '45px'}}>
                  <>
                    <Icon width="24" height="20" classes="button__icon" id="i-filter" />
                    {filtered ? 'Filters Applied' : 'Filters'}
                  </>
                </Button>
              </>
            )}
          </div>
        </div>

        {renderNewsArticles()}

        {(totalPages > 1 || articles?.length >= 50) && (
          <Paginator currentPage={ pageNumber } totalPages={ totalPages } onChange={ updatePage } onPageSizeChange={(page) => updatePage(page, true)} currentPageSize={pageSize}/>
        )}
      </main>
    </Meta>
  )
}

export default withPageHelper(NewsManagement)
