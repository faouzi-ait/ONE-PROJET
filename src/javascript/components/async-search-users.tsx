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
  UserSearchResultType,
  UserType,
} from 'javascript/types/ModelTypes'

export const makeUserName = (user: UserType) => {
  const companySuffix = user?.company ? ` - ${user?.company?.name}` : ''
  return (
    `${user['first-name']} ${user['last-name']}${companySuffix}`
  )
}

const mapUserName = (searchResult: UserSearchResultType) => ({
  ...searchResult,
  name: makeUserName(searchResult.user),
  user: {
    ...searchResult.user,
    name: makeUserName(searchResult.user),
  },
})

export interface UserFilterType {
  filter: {
    [key: string]: string | boolean | number
  }
}

export const AsyncSearchUser: React.FC<{
  clearable: boolean
  onChange: (value: any) => void
  placeholder?: string
  urlContext?: string
  userFilters?: UserFilterType
  value: any
}> = ({
  clearable = true,
  onChange,
  placeholder = 'Search by Name or Email...',
  urlContext = '',
  userFilters = {},
  value,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('')
  return (
    <UserSearchProvider userFilters={userFilters} urlContext={urlContext}>
      {({ suggestions, fetchSuggestions }) => {
        let resolvedSuggestions = (suggestions as UserSearchResultType[]).map(
          mapUserName,
        )
        if (resolvedSuggestions.length === 0 && value && value['first-name'] && !searchKeyword.length) {
          // Crazy method to work around Select.async to pre-populate it with saved value
          const defaultSelection = {
            id: value.id,
            name: makeUserName(value),
            user: {
              ...value,
              name: makeUserName(value),
            },
          }
          resolvedSuggestions = [defaultSelection] as any
          onChange(defaultSelection)
        }

        const handleOnChange = (selectedValue) => {
          setSearchKeyword(selectedValue ? selectedValue['first-name'] : '')
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
            labelKey={'name'}
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
    </UserSearchProvider>
  )
}

const UserSearchProviderComponent: React.FC<{
  children: (params: {
    fetchSuggestions: (keyword: string, callback: any) => void
    onClear: () => void
    suggestions: any[]
  }) => any
  userFilters: UserFilterType | {}
  urlContext: string
  theme: CustomThemeType
}> = ({
  children,
  userFilters,
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
        ...userFilters
      }
      const context = urlContext.length ? `/${urlContext}` : ''
      return query<'user-search-results', UserSearchResultType[]>(`users/search${context}`, 'user-search-results', {
        fields: ['first-name', 'last-name', 'user'],
        include: ['user,user.company'],
        includeFields: {
          users: [
            'first-name',
            'last-name',
            'email',
            'company'
          ],
        },
        filter,
      }).then(users => {
        callback({
          options: users.map(mapUserName),
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

const UserSearchProvider = withTheme(UserSearchProviderComponent)

export default AsyncSearchUser