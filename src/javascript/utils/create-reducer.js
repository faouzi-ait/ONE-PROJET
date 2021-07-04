import { combineReducers } from 'redux'

export default function createReducer(injectedReducers = {}) {
  /** Insert other reducers here */
  const rootReducer = combineReducers({
    ...injectedReducers,
    /** This line of code prevents a console error */
    app: () => ({}),
  })
  return rootReducer
}
