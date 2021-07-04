import { useReducer } from 'react'
import {
  makeActionCreators,
  makeConstants,
  makeDispatchFunctions,
  makeReducer,
  makeSelectors,
} from '../helper-functions/make-reducer'

const useLocalState = <State, Actions, Selectors extends SelectorsType>({
  initialState,
  actions,
  selectors = {},
}: Props<State, Actions, Selectors>): { state: State } & Actions &
  Selectors => {
  const constants = makeConstants({ actions, key: '' })
  const reducer = makeReducer({ initialState, actions, constants })
  const [state, dispatch] = useReducer(reducer, initialState)
  const actionCreators = makeActionCreators({ actions, constants })
  const dispatchFunctions = makeDispatchFunctions({ actionCreators, dispatch })
  const selectFunctions = makeSelectors({ selectors, state })
  // @ts-ignore
  return {
    ...dispatchFunctions,
    ...selectFunctions,
    state,
  }
}

interface Props<State, Actions, Selectors extends SelectorsType> {
  initialState: State
  actions: ActionDefinition<State, Actions>
  selectors?: {
    [K in keyof Selectors]: (state: State, payload?: any) => ReturnType<Selectors[K]>
  } | {}
}

type ActionDefinition<State, Actions> = {
  [K in keyof Actions]: (state: State, ...args: any[]) => State
}

type SelectorsType = {
  [index: string]: (state?: any, payload?: any) => any
}

export default useLocalState
