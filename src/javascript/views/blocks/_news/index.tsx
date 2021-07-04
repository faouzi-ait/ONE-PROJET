import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

import allClientVariables from './variables'
import Card from 'javascript/components/card'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import getGridClass from 'javascript/utils/helper-functions/get-grid-class'

import { NewsArticleType } from 'javascript/types/ModelTypes'

const newsArticleQuery =  {
  include: 'news-article,news-article.news-categories',
  fields: {
    'news-article-search-results': 'title,news-article',
    'news-articles': 'title,images,introduction,slug,publish-date,thumbnail-urls,news-categories',
    'news-categories': 'name',
  },
  'filter[status]': 'published',
}

const NewsBlock = (block, assets, props) => {
  const newsArticleSearchResource = useResource('news-article-search-result')

  const [newsArticles, setNewsArticles] = useState([])
  const newsCV = useClientVariables(allClientVariables)
  const { variables } = useTheme()

  const getNewsArticles = async () => {
    const featuredArticle = !block.category ? await getFeaturedNewsArticle() : []
    let query = {...newsArticleQuery}
    query['page[size]'] = block.numberOfItems - featuredArticle.length
    if (featuredArticle.length) {
      query['filter[exclude-ids]'] = featuredArticle[0].id
    }
    if (block.category) {
      query['filter[news-category]'] = block.category
    }
    newsArticleSearchResource.findAll(query)
    .then((response) => {
      setNewsArticles([
        ...featuredArticle,
        ...response.map((searchResult) => searchResult['news-article'])
      ])
    })
  }

  const getFeaturedNewsArticle = () => new Promise<NewsArticleType[]>((resolve, reject) => {
    let query = {...newsArticleQuery}
    query['page[size]'] = 1
    query['filter[featured]'] = true
    newsArticleSearchResource.findAll(query)
    .then((response) => {
      resolve(response.map((searchResult) => searchResult['news-article']))
    }).catch(reject)
  })

  useEffect(() => {
    getNewsArticles()
  }, [])

  return (
    <div className={`grid grid--${getGridClass(block.numberOfItems)}`}>
      {newsArticles.map((article) => {
        const thumbnail = article['thumbnail-urls'].default?.normal || null
        return (
          <Card
            key={article.id}
            title={article.title}
            description={article.introduction}
            image={{ src: thumbnail, alt: article.title }}
            url={`/${variables.SystemPages.news.path}/${article.slug}`}
            date={article['publish-date']}
          >
            {newsCV.readStoryLink &&
              <NavLink to={article.slug} className="button">Read story</NavLink>
            }
          </Card>
        )
      })}
    </div>
  )
}

export default NewsBlock
