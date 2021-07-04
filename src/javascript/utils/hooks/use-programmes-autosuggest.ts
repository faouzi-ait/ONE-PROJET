import useAutosuggestLogic from './use-autosuggest-logic'
import searchApi from '../search-api'
import { useState, useRef } from 'react'
import { massageParamsToApiConsumableShape } from '../apiMethods'
import programmeSearchResultQuery, {
  ProgrammeSearchResultQueryReturn,
} from '../queries/programme-search-results'
import { ProgrammeSearchResultType } from 'javascript/types/ModelTypes'
import deepmerge from 'deepmerge-concat'

const mapToTitleWithGenreType = (
  programmeSearchResult: ProgrammeSearchResultType,
): ProgrammeSearchResultQueryReturn => ({
  ...programmeSearchResult,
  ...programmeSearchResult.programme,
})

const useProgrammesAutosuggest = ({
  buildParams = () => ({}),
  onLoad = () => {},
}: {
  buildParams: (newValue: any) => any
  onLoad?: (result: any, callback?: (...args: any[]) => any) => void
}) => {
  const resultCache = useRef({})

  const addToCache = (params, results) => {
    resultCache.current = {
      ...resultCache.current,
      [JSON.stringify(params)]: results,
    }
  }

  const getFromCache = params => {
    return resultCache.current[JSON.stringify(params)]
  }

  const programmes = useAutosuggestLogic({
    query: (unTrimmedValue, callback) => {
      const value = `${unTrimmedValue}`.trim()
      if (!value) {
        onLoad([], callback)
        return Promise.resolve([])
      }
      const params = deepmerge(
        massageParamsToApiConsumableShape(
          programmeSearchResultQuery,
          'programme-search-results',
        ),
        buildParams(value),
      )

      const previousResult = getFromCache(params)

      if (previousResult) {
        onLoad(previousResult, callback)
        return Promise.resolve(previousResult)
      }

      return searchApi('programmes', params).then(res => {
        const prettifiedResult: ProgrammeSearchResultQueryReturn[] = res.map(
          mapToTitleWithGenreType,
        )
        addToCache(params, prettifiedResult)
        onLoad(prettifiedResult, callback)
        return prettifiedResult
      })
    },
  })
  return {
    programmeSuggestions: (programmes.suggestions || []).map(
      mapToTitleWithGenreType,
    ),
    searchProgrammes: programmes.fetchSuggestions,
    isLoading: programmes.isLoading,
  }
}

export default useProgrammesAutosuggest

export const ProgrammesAutosuggest = ({
  children,
  buildParams,
  onLoad,
}: {
  children: (
    renderProps: ReturnType<typeof useProgrammesAutosuggest> & {
      value: any
      setValue: (value: any) => void
    },
  ) => any
  buildParams: Parameters<typeof useProgrammesAutosuggest>[0]['buildParams']
  onLoad?: Parameters<typeof useProgrammesAutosuggest>[0]['onLoad']
}) => {
  const [value, setValue] = useState(null)
  const props = {
    ...useProgrammesAutosuggest({ buildParams, onLoad }),
    value,
    setValue,
  }
  return children(props)
}
