import useLocalState from '../../../utils/hooks/use-local-state'
import { useEffect } from 'react'
import api from '../../../utils/api'
import highlightsQuery from './queries/highlightsQuery'
import categoriesQuery from './queries/categoriesQuery'

const useProgrammeHighlightsState = (highlightPageId = null) => {
  const highlightsState = useApiState()
  const categoriesState = useApiState()

  useEffect(() => {
    fetchResources()
  }, [])
  
  const fetchResources = () => {
    console.log(highlightPageId)
    if(highlightPageId){
      highlightsQuery['filter[programme-highlight-page-id]'] = highlightPageId
      categoriesQuery['filter[programme-highlight-page-id]'] = highlightPageId
      delete highlightsQuery['filter[without-page]']
      delete categoriesQuery['filter[without-page]']
    } else {
      highlightsQuery['filter[without-page]'] = true
      categoriesQuery['filter[without-page]'] = true
      delete highlightsQuery['filter[programme-highlight-page-id]']
      delete categoriesQuery['filter[programme-highlight-page-id]']
    }
    api
      .findAll('programme-highlights', {
        ...highlightsQuery
      })
      .then(highlightsState.reportSucceeded)
      .catch(highlightsState.reportFailed)
    
    api
      .findAll('programme-highlight-categories', {
        ...categoriesQuery,
      })
      .then(categoriesState.reportSucceeded)
      .catch(categoriesState.reportFailed)
  }

  return {
    highlights: highlightsState.state.data || [],
    categories: categoriesState.state.data || [],
    fetchResources,
    errored:
      highlightsState.state.status === 'errored' ||
      categoriesState.state.status === 'errored',
    loaded:
      highlightsState.state.status === 'fulfilled' &&
      categoriesState.state.status === 'fulfilled',
    updateHighlightsCache: highlightsState.updateCache,
    updateCategoriesCache: categoriesState.updateCache,
  }
}

const useApiState = () =>
  useLocalState({
    initialState: {
      status: null,
      data: null,
    },
    actions: {
      reportStarted: () => ({
        status: 'loading',
      }),
      reportSucceeded: (_, data) => {
        return {
          status: 'fulfilled',
          data: Array.from(data),
        }
      },
      reportFailed: () => ({
        status: 'errored',
      }),
      updateCache: ({ status }, payload) => ({
        status,
        data: payload,
      }),
    },
  })

export default useProgrammeHighlightsState
