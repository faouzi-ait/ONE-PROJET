import React from 'react'
import { ProductionCompanyType } from 'javascript/types/ModelTypes'
import AsyncSelect from 'javascript/components/async-select'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
import { findAllByModel } from 'javascript/utils/apiMethods'

export const ProductionCompaniesSelect: React.FC<{
  value: ProductionCompanyType[]
  onChange: (newValue: ProductionCompanyType[]) => void
  placeholder?: string
}> = ({ value, onChange, placeholder }) => {
  const { fetchSuggestions, suggestions } = useAutosuggestLogic({
    query: async (input, callback) => {
      if (!input) {
        callback({ options: [] })
        return Promise.resolve([])
      }
      return findAllByModel('production-companies', {
        fields: ['name', 'id'],
        filter: {
          search: input,
          'for-producer-hub': true,
        },
      }).then(options => {
        callback({
          options,
        })
        return options
      })
    },
  })
  return (
    <AsyncSelect
      value={value}
      loadOptions={fetchSuggestions}
      onChange={onChange}
      placeholder={placeholder}
      labelKey="name"
      options={suggestions}
      multi
    ></AsyncSelect>
  )
}
