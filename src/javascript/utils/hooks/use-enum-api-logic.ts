import useLocalState from './use-local-state'

const useEnumApiLogic = () =>
  useLocalState<State, Actions, {}>({
    initialState: {
      data: null,
      status: 'idle',
    },
    actions: {
      reportError: (state) => ({
        ...state,
        status: 'errored',
      }),
      reportFulfilled: (state, payload) => ({
        status: 'fulfilled',
        data: payload,
      }),
      reportStarted: state => ({
        ...state,
        status: 'loading',
      }),
      updateCache: (state, payload) => ({
        ...state,
        data: payload,
      }),
      reset: () => ({ status: 'idle' }),
    },
  })

interface State {
  data?: any
  status: 'idle' | 'loading' | 'fulfilled' | 'errored'
}

interface Actions {
  reportStarted: () => void
  reportFulfilled: (data?: any) => void
  reportError: (e?: Error) => void
  reset: () => void
  updateCache: (payload: any) => void
}

export default useEnumApiLogic

export const reduceEnums = (...enums: State['status'][]): State['status'] => {
  if (enums.includes('errored')) {
    return 'errored'
  }
  if (enums.includes('loading')) {
    return 'loading'
  }
  if (enums.includes('fulfilled')) {
    return 'fulfilled'
  }
  return 'idle'
}
