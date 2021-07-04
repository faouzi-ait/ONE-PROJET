import reduceToObject from './reduce-to-object'

export type KeyedObject = { [index: string]: any }
export type ActionObject = {
  [index: string]: (state: any, ...payload: any[]) => any
}
export type ActionCreatorsType = {
  [index: string]: (...payload: any[]) => { type: string; payload: any[] }
}

export const makeConstants = ({
  key,
  actions,
}: {
  key: string
  actions: ActionObject
}) => ({
  ...Object.keys(actions)
    .map(actionName => ({
      [actionName]: `${key}/${constant(actionName)}`,
    }))
    .reduce(reduceToObject, {}),
})

export const makeReducer = ({
  initialState,
  actions,
  constants,
}: {
  initialState: KeyedObject
  actions: ActionObject
  constants: KeyedObject
}) => (
  state = initialState,
  { type, payload }: { type: string; payload: any[] },
) => {
  const cases = [
    ...Object.keys(actions).map(actionName => ({
      type: constants[actionName],
      // @ts-ignore
      action: actions[actionName],
    })),
  ]
  return (
    cases
      .filter(c => type === c.type)
      /**
       * Runs through each case that matches the type, and calls
       * it with (state, payload). At the end of the reduce, returns
       * the state
       */
      .reduce((a, b) => (b.action ? b.action(a, ...payload) : a), state)
  )
}

export const makeActionCreators = ({
  actions,
  constants,
}: {
  actions: ActionObject
  constants: KeyedObject
}) => ({
  ...Object.keys(actions)
    .map(actionName => ({
      [actionName]: (...args: any[]) => {
        return {
          type: constants[actionName],
          payload: args,
        }
      },
    }))
    .reduce(reduceToObject, {}),
})

export const makeDispatchFunctions = ({
  actionCreators,
  dispatch,
}: {
  actionCreators: ActionCreatorsType
  dispatch: (action: { type: string; payload?: any[] }) => void
}) => ({
  ...Object.keys(actionCreators)
    .map(actionName => ({
      [actionName]: (...args: any[]) => {
        /** Don't allow events as payloads - slows down redux dev tools */
        if (args[0] && args[0].stopPropagation) {
          dispatch(actionCreators[actionName]())
        } else {
          dispatch(actionCreators[actionName](...args))
        }
      },
    }))
    .reduce(reduceToObject, {}),
})

export const makeSelectors = ({
  selectors = {},
  state,
}: {
  selectors: ActionObject
  state: any
}) => ({
  ...Object.keys(selectors).reduce(
    (object: {}, key) => ({
      ...object,
      [key]: payload => selectors[key](state, payload),
    }),
    {},
  ),
})

const parseCamelCaseToArray = (value: string) =>
  value.replace(/([A-Z])/g, letter => ` ${letter}`).split(' ')

const constant = (value: string) =>
  parseCamelCaseToArray(value)
    .map(word => word.toUpperCase())
    .join('_')
