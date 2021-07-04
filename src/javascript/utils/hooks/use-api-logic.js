import useLocalState from './use-local-state'

const useApiLogic = initialState =>
  useLocalState({
    initialState: {
      isLoading: false,
      data: null,
      errored: false,
      succeeded: false,
      errors: null,
      lastAction: null,
      lastResource: null,
      ...initialState,
    },
    actions: {
      reportStarted: state => ({
        isLoading: true,
        data: null,
        errored: false,
        succeeded: false,
        errors: null,
        lastAction: null,
        lastResource: null,
      }),
      reportFailed: (state, payload) => {
        const { action, errors, resource } = payload
        return ({
        isLoading: false,
        data: null,
        errored: true,
        succeeded: false,
        errors,
        lastAction: action,
        lastResource: resource,
      })
      },
      reportSucceeded: (state, payload) => {
        const { action, resource, response, queryParams, meta } = payload
        return  ({
          isLoading: false,
          data: response,
          errored: false,
          succeeded: true,
          errors: null,
          lastAction: action,
          lastResource: resource,
          lastQueryParams: queryParams,
          lastMeta: meta,
        })
      },
      reset: () => ({
        isLoading: false,
        data: null,
        errored: false,
        succeeded: false,
        errors: null,
        lastAction: null,
        lastResource: null,
        ...initialState,
      }),
    },
    selectors: {
      getDataAsArray: state => {
        if (Array.isArray(state.data)) {
          return state.data
        }
        if (state.data !== null) {
          return [state.data]
        }
        return null
      },
      getDataById: (state, id) => {
        if (Array.isArray(state.data)) {
          return state.data.find(item => Number(item.id) === Number(id)) || null
        }
        if (state.data !== null) {
          return Number(state.data.id) === Number(id) ? state.data : null
        }
        return null
      },
    },
  })

export default useApiLogic
