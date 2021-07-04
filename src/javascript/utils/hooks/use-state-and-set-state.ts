import useLocalState from './use-local-state'

const useStateAndSetState = <State>(
  state: State,
): { state: State; setState: Actions<State>['setState'] } => {
  return useLocalState<State, Actions<State>, any>({
    initialState: state,
    actions: {
      setState: (state, newState: SetStateInput<State>) => {
        if (typeof newState === 'function') {
          return {
            ...state,
            ...newState(state),
          }
        }
        return { ...state, ...newState }
      },
    },
  })
}

type SetStateInput<State> =
  | Partial<State>
  | ((oldState: State) => Partial<State>)

interface Actions<State> {
  setState: (state: SetStateInput<State>) => void
}

export default useStateAndSetState
