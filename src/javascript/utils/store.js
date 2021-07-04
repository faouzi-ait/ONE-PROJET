import { createStore, compose } from 'redux'
import createReducer from './create-reducer'

function configureStore(initialState = {}) {
  let composeEnhancers = compose
  if (process.env.NODE_ENV !== 'production' && typeof window === 'object') {
    /* eslint-disable no-underscore-dangle */
    if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    /* eslint-enable */
  }

  const store = createStore(createReducer(), initialState, composeEnhancers())
  store.injectedReducers = {}

  if (module.hot) {
    module.hot.accept('./create-reducer', () => {
      store.replaceReducer(createReducer(store.injectedReducers))
    })
  }

  return store
}

const store = configureStore({})

export default store;