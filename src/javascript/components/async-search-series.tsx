import React from 'react'
import Select from 'react-select'
import { query } from 'javascript/utils/apiMethods'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
// Types
import {
  SeriesSearchResultType,
  SeriesType,
} from 'javascript/types/ModelTypes'
import useTheme from 'javascript/utils/theme/useTheme'

export const makeSeriesName = (series: SeriesType) => (
  `${series.name}${series?.['programme-title-with-genre'] ? ` - ${series?.['programme-title-with-genre']}` : ''}`
)

const mapSeriesName = (searchResult: SeriesSearchResultType) => ({
  ...searchResult,
  name: makeSeriesName(searchResult.series),
  series: {
    ...searchResult.series,
    name: makeSeriesName(searchResult.series),
  },
})

export interface SeriesFilterType {
  [key: string]: string | boolean | number
}

export const AsyncSearchSeries: React.FC<{
  clearable: boolean
  onChange: (value: any) => void
  placeholder?: string
  urlContext?: string
  seriesFilters?: SeriesFilterType
  value: any
}> = ({
  clearable = true,
  onChange,
  placeholder,
  seriesFilters = {},
  value,
}) => {
  const { localisation } = useTheme()
  return (
    <SeriesSearchProvider seriesFilters={seriesFilters} >
      {({ suggestions, fetchSuggestions }) => {
        let resolvedSuggestions = (suggestions as SeriesSearchResultType[]).map(
          mapSeriesName,
        )

        return (
          <Select.Async
            value={value}
            onChange={onChange}
            options={resolvedSuggestions}
            loadOptions={(search, callback) => {
              fetchSuggestions(search, callback)
            }}
            labelKey={'name'}
            filterOption={() => true}
            valueKey={'id'}
            autoload={false}
            placeholder={placeholder || `Search by ${localisation.series.upper} or ${localisation.programme.upper}...`}
            cache={false}
            clearable={clearable}
            backspaceRemoves={clearable}
          />
        )
      }}
    </SeriesSearchProvider>
  )
}

const SeriesSearchProvider: React.FC<{
  children: (params: {
    fetchSuggestions: (keyword: string, callback: any) => void
    onClear: () => void
    suggestions: any[]
  }) => any
  seriesFilters: SeriesFilterType | {}
}> = ({
  children,
  seriesFilters,
}) => {
  const { fetchSuggestions, onClear, suggestions } = useAutosuggestLogic({
    query: async (input, callback) => {
      if (!input) {
        callback({ options: [] })
        return Promise.resolve([])
      }
      const filter = {
        keywords: encodeURIComponent(input),
        ...seriesFilters
      }
      return query<'series-search-results', SeriesSearchResultType[]>(`series/search`, 'series-search-results', {
        fields: ['name', 'series'],
        include: ['series'],
        includeFields: {
          series: [
            'name',
            'programme-title-with-genre',
          ],
        },
        filter,
      }).then(users => {
        callback({
          options: users.map(mapSeriesName),
        })
        return users
      })
    },
  })

  return children({
    suggestions: suggestions,
    onClear,
    fetchSuggestions,
  })
}

export default AsyncSearchSeries
