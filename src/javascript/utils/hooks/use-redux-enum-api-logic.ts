import useReduxState from './use-redux-state'

const useReduxEnumApiLogic = key =>
  useReduxState<State, Actions, any>({
    key,
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
        data: payload,
      }),
      reportStarted: state => ({
        ...state,
        status: 'loading',
      }),
      reset: () => ({ status: 'idle' }),
    },
    selectors: {},
  })

interface State {
  data?: any
  status: StatusEnum
}

export type StatusEnum = 'idle' | 'loading' | 'fulfilled' | 'errored'

interface Actions {
  reportStarted: () => void
  reportFulfilled: () => void
  reportError: (e?: Error) => void
  reset: () => void
}

export default useReduxEnumApiLogic
