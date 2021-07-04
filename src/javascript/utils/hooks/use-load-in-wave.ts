import useLocalState from './use-local-state'
import { useRef } from 'react'
import useAsyncProcessChecker from './use-async-process-checker'

const useLoadInWave = <Query extends (...args: any[]) => any>({
  query,
  pageSize,
}: Params<Query>) => {
  const fetchProcess = useAsyncProcessChecker()

  const {
    state,
    reportStarted,
    reportError,
    reportFulfilled,
    reportLoadingMore,
    updateCache,
  } = useLocalState<State, Actions, {}>({
    initialState: {
      data: null,
      status: 'idle',
    },
    actions: {
      reportError: state => ({
        ...state,
        status: 'errored',
      }),
      reportFulfilled: (state, payload) => ({
        status: 'fulfilled',
        data: [...(state.data || []), ...(payload || [])],
      }),
      reportStarted: state => ({
        ...state,
        status: 'loading',
        data: [],
      }),
      reportLoadingMore: (state, payload) => ({
        ...state,
        status: 'loadingMore',
        data: [...(state.data || []), ...(payload || [])],
      }),
      updateCache: (state, payload) => {
        fetchProcess.end()
        return {
          ...state,
          data: payload,
        }
      },
      reset: () => {
        fetchProcess.end()
        return { status: 'idle' }
      },
    },
  })

  const page = useRef(1)

  const fetchQuery = (...params) => {
    const thisProcessId = fetchProcess.begin()

    const recursiveFetch = currentPage => {
      if (!fetchProcess.checkIfShouldContinue(thisProcessId)) {
        return Promise.resolve(null)
      }
      page.current = currentPage
      return query(
        { page: page.current, pageSize },
        // @ts-ignore
        ...params,
      ).then(data => {
        if (!fetchProcess.checkIfShouldContinue(thisProcessId)) {
          return null
        }
        if (Number(data.meta['page-count']) > currentPage) {
          reportLoadingMore(data)
          return recursiveFetch(currentPage + 1)
        }
        return data
      })
    }

    reportStarted()
    recursiveFetch(1)
      .then(data => {
        if (data) {
          reportFulfilled(data)
        }
      })
      .catch(e => {
        reportError(e)
      })
  }
  return {
    status: state.status,
    data: state.data || [],
    fetchQuery: fetchQuery,
    updateCache,
  }
}

interface Params<Query extends (...args: any[]) => any> {
  query: (
    options: { page: number; pageSize: number },
    ...params: Parameters<Query>
  ) => ReturnType<Query>
  pageSize: number
}

interface State {
  data?: any[]
  status: 'idle' | 'loading' | 'fulfilled' | 'errored' | 'loadingMore'
}

interface Actions {
  reportStarted: () => void
  reportFulfilled: (data: any[]) => void
  reportError: (e?: Error) => void
  reset: () => void
  updateCache: (payload: any) => void
  reportLoadingMore: (data: any[]) => void
}

export default useLoadInWave
