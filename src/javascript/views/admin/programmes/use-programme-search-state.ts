import useReduxState from 'javascript/utils/hooks/use-redux-state'

interface State {
  lastSearchParams: string
}

interface Actions {
  setLastSearchParams: (params: string) => void
}

type Selectors = {
  lastSearchParams: () => string
}

const getInitialState = () => ({
  lastSearchParams: '',
})

const useProgrameSearchState = () => {
  return useReduxState<State, Actions, Selectors>({
    key: 'cmsProgrammeSearchParams',
    initialState: getInitialState(),
    actions: {
      setLastSearchParams: (state, lastSearchParams) => ({
        ...state,
        lastSearchParams
      }),
    },
    selectors: {
      lastSearchParams: (state) => state.lastSearchParams,
    }
  })
}

export default useProgrameSearchState


