import React from 'react'

import Select from 'react-select'
import { findAllByModel } from 'javascript/utils/apiMethods'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'

export type AsyncSearchResultType = {
  id: number,
  name: string
}

export type AsyncSearchResourceTypeType = 'production-companies' | 'companies' | 'territories' | 'regions' | 'broadcasters'

type OptionType = {
  id: string
  name: string
  [key: string]: any
}

interface Props {
  onChange: (value: AsyncSearchResultType | AsyncSearchResultType[]) => void
  limit?: number
  multi?: boolean
  clearable?: boolean
  simpleValue?: boolean
  placeholder?: string
  filter?: { [key: string]: string }
  query?: any
  mapResults?: (result: any) => OptionType
  resourceType: AsyncSearchResourceTypeType
  value: AsyncSearchResultType | AsyncSearchResultType[]
  prefetchPageSize?: number
}

const AsyncSearchResource: React.FC<Props> = (props) => {
  const { fetchSuggestions, suggestions } = useAutosuggestLogic({
    query: async (input, callback) => {
      if (!props.prefetchPageSize && !input) {
        callback({ options: [] })
        return Promise.resolve([])
      }
      const queryFilters = {
        filter: { ...props.filter },
        page: { size: 10 }
      }
      if (input) {
        queryFilters.filter['search'] = encodeURIComponent(input)
      } else {
        queryFilters.page['size'] = props.prefetchPageSize
      }
      const defaultQuery = {
        fields: ['id', 'name']
      }

      return findAllByModel(props.resourceType, {
        ...queryFilters,
        ...(props.query || defaultQuery)
      }).then((response) => {
        let options = props.mapResults ? response.map(props.mapResults) : response
        if (!props.mapResults && !input && props.prefetchPageSize && props.prefetchPageSize === response.length) {
          options.push({
            name: 'Type to search more records...',
            id: -1,
            className: 'Select__info-option'
          } as any)
        }
        callback({ options })
        return options
      })
    },
  })
  const isValueLimitExceeded = () => {
    if (props.multi && props.limit && Array.isArray(props.value)) {
      return props.value?.length >= props.limit
    }
    return false
  }

  return (
    <Select.Async
      {...props}
      options={isValueLimitExceeded() ? [] : suggestions}
      onChange={(values) => {
        if (!values) {
          props.onChange(values)
        } else if (props.multi) {
          props.onChange(values.filter(value => value.id !== -1))
        } else {
          props.onChange(values.id === -1 ? null : values)
        }
      }}
      loadOptions={fetchSuggestions}
      aria-label={props['aria-label'] || props.resourceType}
      onFocus={(e) => {
        if (suggestions.length === 0 && props.prefetchPageSize) {
          fetchSuggestions('', () => {})
        }
      }}
      filterOption={() => true}
      {...(!props.mapResults && {
        labelKey: 'name',
        valueKey: 'id'
      })}
      searchPromptText={isValueLimitExceeded() ? 'Selection limit reached' : 'Type to search'}
      autoload={false}
      cache={false}
    />
  )
}

export default AsyncSearchResource
