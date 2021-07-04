import {
  ProgrammeSearchResultType,
  ProgrammeType,
} from 'javascript/types/ModelTypes'
import { ApiParams } from 'javascript/utils/apiMethods'
import useProgrammesAutosuggest from 'javascript/utils/hooks/use-programmes-autosuggest'
import React from 'react'
import AsyncSelect from './async-select'

interface Props {
  value: any
  onChange: (programme: ProgrammeSearchResultType & ProgrammeType) => void
  placeholder?: string
  filter?: ApiParams<'programme-search-results'>['filter']
  buildParams?: (value: string) => any
  required?: boolean
  multi?: boolean
}

const AsyncSearchProgrammes: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  filter = {},
  buildParams,
  required,
  multi = false
}) => {
  const { programmeSuggestions, searchProgrammes } = useProgrammesAutosuggest({
    buildParams:
      buildParams ||
      (value => ({
        filter: {
          ...filter,
          keywords: encodeURIComponent(value),
        },
      })),
    /** Some wild stuff to get around
     * Select.Async
     */
    onLoad: (options, callback) => {
      callback({
        options,
      })
    },
  })

  return (
    <AsyncSelect
      value={value}
      onChange={onChange}
      loadOptions={searchProgrammes}
      options={programmeSuggestions}
      labelKey="title-with-genre"
      valueKey="id"
      placeholder={placeholder || 'Type to search'}
      required={required}
      multi={multi}
    ></AsyncSelect>
  )
}

export default AsyncSearchProgrammes
