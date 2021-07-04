import React, { useState } from 'react'
import Select from 'react-select'
// hoc
import withTheme from 'javascript/utils/theme/withTheme'
// hooks
import { query } from 'javascript/utils/apiMethods'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  NewsArticleSearchResultType,
  NewsArticleType,
} from 'javascript/types/ModelTypes'

export const makeNewsArticleName = (newsArticle: NewsArticleType) => `${newsArticle.title}`

const mapNewsArticleName = (searchResult: NewsArticleSearchResultType) => ({
  ...searchResult,
  name: makeNewsArticleName(searchResult['news-article']),
  'news-article': {
    ...searchResult['news-article'],
    name: makeNewsArticleName(searchResult['news-article']),
  },
})

export interface NewsArticleFilterType {
  filter?: {
    [key: string]: string | boolean | number
  }
}

export const AsyncSearchNewsArticle: React.FC<{
  clearable?: boolean
  onChange: (value: any) => void
  placeholder?: string
  urlContext?: string
  newsArticleFilters?: NewsArticleFilterType
  value: any
}> = ({
  clearable = true,
  onChange,
  placeholder = 'Search by Title...',
  urlContext = '',
  newsArticleFilters = {},
  value,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('')
  return (
    <NewsArticleSearchProvider newsArticleFilters={newsArticleFilters} urlContext={urlContext}>
      {({ suggestions, fetchSuggestions }) => {
        let resolvedSuggestions = (suggestions as NewsArticleSearchResultType[]).map(
          mapNewsArticleName,
        )
        if (resolvedSuggestions.length === 0 && value && value['title'] && !searchKeyword.length) {
          // Crazy method to work around Select.async to pre-populate it with saved value
          const defaultSelection = {
            id: value.id,
            name: makeNewsArticleName(value),
            'news-article': {
              ...value,
              name: makeNewsArticleName(value),
            },
          }
          resolvedSuggestions = [defaultSelection] as any
          onChange(defaultSelection)
        }

        const handleOnChange = (selectedValue) => {
          setSearchKeyword(selectedValue ? selectedValue['title'] : '')
          onChange(selectedValue)
        }
        return (
          <Select.Async
            value={value}
            onChange={handleOnChange}
            options={resolvedSuggestions}
            loadOptions={(search, callback) => {
              setSearchKeyword(search)
              fetchSuggestions(search, callback)
            }}
            labelKey={'title'}
            filterOption={() => true}
            valueKey={'id'}
            autoload={false}
            placeholder={placeholder}
            cache={false}
            clearable={clearable}
            backspaceRemoves={clearable}
          />
        )
      }}
    </NewsArticleSearchProvider>
  )
}

const NewsArticleSearchProviderComponent: React.FC<{
  children: (params: {
    fetchSuggestions: (keyword: string, callback: any) => void
    onClear: () => void
    suggestions: any[]
  }) => any
  newsArticleFilters: NewsArticleFilterType | {}
  urlContext: string
  theme: CustomThemeType
}> = ({
  children,
  newsArticleFilters,
  urlContext,
}) => {
  const { fetchSuggestions, onClear, suggestions } = useAutosuggestLogic({
    query: async (input, callback) => {
      if (!input) {
        callback({ options: [] })
        return Promise.resolve([])
      }
      const filter = {
        keywords: encodeURIComponent(input),
        ...newsArticleFilters
      }
      const context = urlContext.length ? `/${urlContext}` : ''
      return query<'news-article-search-results', NewsArticleSearchResultType[]>(`news-articles/search${context}`, 'news-article-search-results', {
        fields: ['title', 'news-article'],
        include: ['news-article'],
        includeFields: {
          'news-articles': [
            'title',
          ],
        },
        filter,
      }).then(articles => {
        callback({
          options: articles.map(mapNewsArticleName),
        })
        return articles
      })
    },
  })

  return children({
    suggestions: suggestions,
    onClear,
    fetchSuggestions,
  })
}

const NewsArticleSearchProvider = withTheme(NewsArticleSearchProviderComponent)

export default AsyncSearchNewsArticle
