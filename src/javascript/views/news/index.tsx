import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import queryString from 'query-string'

import allClientVariables from './variables'
import useResource from 'javascript/utils/hooks/use-resource'
import withLoader from 'javascript/components/hoc/with-loader'
import useTheme from 'javascript/utils/theme/useTheme'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

// Components
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Card from 'javascript/components/card'
import Paginator from 'javascript/components/paginator'
import Select from 'react-select'
import Meta from 'react-document-meta'

import 'stylesheets/core/components/news.sass'

import { NewsArticleType } from 'javascript/types/ModelTypes'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

interface Props {
  pageIsLoading: (state?: any) => void | boolean
  pageReceivedError: (error: any) => void
}

const newsArticleQuery = {
  include: 'news-article,news-article.news-categories',
  fields: {
    'news-article-search-results': 'title,news-article',
    'news-articles': 'title,images,introduction,slug,publish-date,thumbnail-urls,news-categories',
    'news-categories': 'name',
  },
  'filter[with-aggregations]': true,
  'filter[status]': 'published',
}

const NewsIndex: React.FC<Props> = ({
  pageIsLoading,
  pageReceivedError,
}) => {
  const { localisation, variables } = useTheme()
  const newsArticleSearchResource = useResource('news-article-search-result')
  const newsCategoryResource = useResource('news-category')
  const pageResource = useResource('page')

  const [newsPageResource, setNewsPageResource] = useState({})
  const [featuredNewsArticle, setFeaturedNewsArticle] = useState(null)
  const [newsArticles, setNewsArticles] = useState<NewsArticleType[] & {meta: any}>([] as any)
  const [newsCategories, setNewsCategories] = useState(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  const urlCategory = queryString.parse(location.search, {parseNumbers: true}).category as number
  const allCategories = { value: null, label: 'All' }
  const [selectedCategory, setSelectedCategory] = useState<typeof allCategories & any>(urlCategory || allCategories)


  const getNewsArticles = async () => {
    const featuredArticle = await getFeaturedNewsArticle()
    setFeaturedNewsArticle(featuredArticle)
    let query = {...newsArticleQuery}
    query['page[number]'] = pageNumber
    query['page[size]'] = pageSize
    if (featuredArticle) {
      query['filter[exclude-ids]'] = featuredArticle.id
    }
    query = injectCategoryFilter(query, selectedCategory)
    newsArticleSearchResource.findAll(query)
    .then((response) => {
      let update = response.map((searchResult) => searchResult['news-article'])
      update.meta = response.meta
      setTotalPages(response.meta['page-count'])
      if (!newsCategories) { // Only fetch once.
        const idsSet = new Set()
        if (featuredArticle) {
          //@ts-ignore
          featuredArticle.meta['news-category-ids'].forEach((id) => idsSet.add(id))
        }
        response.meta['news-category-ids'].forEach((id) => idsSet.add(id))
        getNewsCategories(Array.from(idsSet))
      }
      setNewsArticles(update)
    })
  }

  const getNewsCategories = (categoryIds = []) => {
    if (categoryIds.length === 0) {
      return setNewsCategories([])
    }
    newsCategoryResource.findAll({
      fields: {
        'news-categories': 'name'
      },
      'filter[id]': categoryIds,
      sort: 'position'
    })
    .then((response) => {
      const options = [
        allCategories,
        ...response.map(createCategoryOption)
      ]
      setNewsCategories(options)
    })
  }

  const injectCategoryFilter = (query, selectedCategory) => {
    const newQuery = {...query}
    if (selectedCategory?.value) {
      newQuery['filter[news-category]'] = selectedCategory.value
    } else if(typeof selectedCategory === 'number') {
      newQuery['filter[news-category]'] = selectedCategory
    }
    return newQuery
  }

  const createCategoryOption = (category) => ({
    value: category.id,
    label: category.name,
    category,
  })

  const getFeaturedNewsArticle = () => new Promise<NewsArticleType>((resolve, reject) => {
    let query = {...newsArticleQuery}
    query['page[size]'] = 1
    query['filter[featured]'] = true
    query = injectCategoryFilter(query, selectedCategory)
    newsArticleSearchResource.findAll(query)
    .then((response) => {
      const featuredArticle = response.map((searchResult) => searchResult['news-article'])[0] || null
      if (featuredArticle) {
        featuredArticle.meta = response.meta
      }
      resolve(featuredArticle)
    }).catch(reject)
  })

  const getNewsPageResource = () => {
    pageResource.findAll({
      include: 'meta-datum',
      fields: {
        'pages': 'banner-text-color,banner-urls,meta-datum',
        'meta-datums': 'description'
      },
      'filter[page-type]': 'news'
    })
    .then((response) => {
      if (!response.length) {
        pageReceivedError(`:: path not registered: ${variables.SystemPages.news.path}`)
      }
      setNewsPageResource(response[0] || null)
    })
  }

  useEffect(() => {
    getNewsPageResource()
    if (Object.keys(location.search || {}).length) {
      window.history.replaceState(null, null, location.pathname)
    }
  }, [])

  useEffect(() => {
    if (newsCategories && Object.keys(newsPageResource).length) {
      pageIsLoading(false)
    }
  }, [newsPageResource, newsCategories])

  useEffect(() => {
    getNewsArticles()
  }, [selectedCategory, pageNumber])

  const newsCV = useClientVariables(allClientVariables)
  const meta = newsPageResource?.['meta-datum']

  return pageIsLoading() ? null : (
    <Meta
      title={meta?.title || `${localisation.client} :: ${variables.SystemPages.news.upper}`}
      meta={{
        description: meta?.description || `Viewing ${variables.SystemPages.news.upper} listings`,
        keywords: meta?.keywords || '',
      }}
    >
      <main>
        <div className="fade-on-load news">
          <LoadPageBannerImage slug={`${variables.SystemPages.news.path}`} fallbackBannerImage={newsCV.bannerFallbackImage } >
            {({ image }) => (
              <Banner
                title={variables.SystemPages.news.upper}
                classes={newsCV.bannerClasses}
                image={image}
                textColor={newsPageResource['banner-text-color'] || null}
              />
            )}
          </LoadPageBannerImage>
          <Breadcrumbs
            paths={[{
              name: variables.SystemPages.news.upper,
              url: variables.SystemPages.news.path
            }]}
            classes={['bordered']}
          />

          { newsCategories?.length > 0 && (
            <div className={newsCV.sectionPageControlsClasses}>
              <div className="container">
                <div className={newsCV.pageControlClasses}>
                  <div className="page-controls__right">
                    <div className="page-controls__control news__categories-filter">
                      <span>{pluralize(localisation.newsCategory.upper)}:</span>
                      <Select
                        searchable={true}
                        options={newsCategories}
                        value={selectedCategory}
                        clearable={false}
                        onChange={(value) => {
                          setSelectedCategory(value)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!featuredNewsArticle && newsArticles.length === 0 && (
            <section className={newsCV.sectionClasses}>
              <div className="container" style={{textAlign: 'center', marginTop: '80px'}}>
                {`There is currently no ${localisation.news.lower} available.`}
              </div>
            </section>
          )}

          {featuredNewsArticle && pageNumber === 1 && (
            <section className={newsCV.sectionClasses}>
              <div className="container news__featured">
                <Card
                  title={featuredNewsArticle.title}
                  description={featuredNewsArticle.introduction}
                  date={featuredNewsArticle['publish-date']}
                  url={`${variables.SystemPages.news.path}/${featuredNewsArticle.slug}`}
                  size="large"
                  image={{ src: featuredNewsArticle['thumbnail-urls'].default?.normal || '', alt: featuredNewsArticle.title }}
                  classes={['featured']}
                  tags={featuredNewsArticle['news-categories']}
                  tagsAlwaysVisible
                />
              </div>
            </section>
          )}

          <section className={newsCV.sectionClasses}>
            <div className="container">
              <div className={newsCV.gridClasses}>
              {newsArticles.map((article, i) => {
                const thumbnail = article['thumbnail-urls'].default?.normal || null
                return (
                  <Card
                    key={i}
                    title={article.title}
                    size={newsCV.cardSize}
                    description={article.introduction}
                    date={article['publish-date']}
                    url={`${variables.SystemPages.news.path}/${article.slug}`}
                    image={{ src: thumbnail, alt: article.title }}
                    classes={newsCV.cardClasses}
                    tags={article['news-categories']}
                    tagsAlwaysVisible
                  />
                )
              })}
              </div>
              {newsArticles.meta && newsArticles.meta['page-count'] > 1 &&
                <Paginator currentPage={pageNumber} totalPages={totalPages} onChange={setPageNumber} />
              }
            </div>
          </section>
        </div>
      </main>
    </Meta>
  )
}

export default withLoader(NewsIndex)
