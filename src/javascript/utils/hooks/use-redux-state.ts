/* eslint-disable object-shorthand */
/* eslint-disable func-names */
import React, { useCallback } from 'react'
import useInjectReducer from './use-inject-reducer'
import { ReactReduxContext } from 'react-redux'
import {
  makeConstants,
  makeReducer,
  makeActionCreators,
  makeDispatchFunctions,
  makeSelectors,
} from '../helper-functions/make-reducer'

const useReduxState = <State, Actions, Selectors extends SelectorsType = {}>({
  key,
  initialState,
  actions,
  selectors = {},
}: Props<State, Actions, Selectors>): ReduxStateReturn<State> & Actions & Selectors => {
  const constants = makeConstants({
    key,
    actions,
  })

  const reducer = makeReducer({ initialState, actions, constants })
  const actionCreators = makeActionCreators({ actions, constants })

  useInjectReducer({ key, reducer })

  const context: any = React.useContext(ReactReduxContext)

  const dispatchFunctions = makeDispatchFunctions({
    actionCreators,
    dispatch: context.store.dispatch,
  })

  const [state, setState] = React.useState(context.store.getState()[key] || initialState)

  const handleChange = useCallback(() => {
    setState(context.store.getState()[key])
  }, [context.store, key])

  React.useEffect(() => context.store.subscribe(handleChange), [
    context.store,
    handleChange,
  ])

  const selectFunctions = makeSelectors({ selectors, state })

  // @ts-ignore
  return {
    ...selectFunctions,
    ...dispatchFunctions,
    state: state || initialState,
  }
}

interface Props<State, Actions, Selectors extends SelectorsType> {
  key: string
  initialState: State
  actions: ActionDefinition<State, Actions>
  selectors?: {
    [K in keyof Selectors]: (state: State, payload?: any) => ReturnType<Selectors[K]>
  } | {}
}

type SelectorsType = {
  [index: string]: (state: any, payload?: any) => any
}

type ActionDefinition<State, Actions> = {
  [K in keyof Actions]: (state: State, payload: any) => State
}

export interface ReduxStateReturn<State> {
  state: State
}

export default useReduxState
