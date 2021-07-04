## Hooks

The hooks in this file, along with the HOC `withHooks`, can be used to compose stateful logic in reusable chunks.

### useLocalState

Let's start with the lowest level stuff first.

```js
const modal = useLocalState({
  initialState: {
    isOpen: false,
  },
  actions: {
    toggle: (state) => ({ ...state, isOpen: !state.isOpen }),
    changeViaPayload: (state, payload) => ({ ...state, isOpen: payload })
  }
})

<button onClick={() => modal.toggle()}>
  {modal.state.isOpen ? `It's open!` : `It's closed...`}
</button>

<button onClick={() => modal.changeViaPayload(false)}>
  Close The Modal
</button>
```

`useLocalState` can be used to create stateful logic. It acts like a reducer, with actions and state. Under the hood, it uses React's `useReducer` hook, and builds a reducer from the parameters you provide.

#### Selectors

You can also provide selectors to `useLocalState`:

```js
const list = useLocalState({
  initialState: {
    data: [],
  },
  actions: {
    append: (state, payload) => ({ ...state, data: [...state.data, payload] })
  },
  selectors: {
    getFirstOfList: (state) => state.data[0] || null,
  }
})

<button onClick={() => list.append('new thing')}>
  Append a new thing
</button>

<div>
  {list.getFirstOfList()}
</div>
```

This is a convenience to help you compute tricky values.

### useInjectReducer

`useInjectReducer` is an extraordinary piece of code, pulled from the `react-boilerplate` repo. Usually, a redux SPA has to load all its reducers on first load. `useInjectReducer` allows you to dynamically inject pieces of state into redux as you go along.

It's very simple to use:

```js
// A dummy reducer, you can take in actions and do a switch statement if you like
const modalReducer = () => {
  return {
    isOpen: false,
  }
}

useInjectReducer({ key: 'modal', reducer: modalReducer })
```

The app has to be wrapped with a `<Provider />` component, and the store has to be configured with a `store.injectedReducers = {}` attribute.

### useReduxState

`useReduxState` combines the two hooks above. It builds a reducer in the same fashion as React's `useReducer`, then injects it into redux.

This means you can pull state in and out of redux easily. You just switch the function from `useLocalState` to `useReduxState` and add a `key` attribute.

```js
const modal = useReduxState({
  key: 'modal',
  initialState: {
    isOpen: false,
  },
  actions: {
    toggle: (state) => ({ ...state, isOpen: !state.isOpen }),
    changeViaPayload: (state, payload) => ({ ...state, isOpen: payload })
  }
})

<button onClick={() => modal.toggle()}>
  {modal.state.isOpen ? `It's open!` : `It's closed...`}
</button>

<button onClick={() => modal.changeViaPayload(false)}>
  Close The Modal
</button>
```

#### How to share state between components

Let's say you want two disconnected components to share some state. To do that, you should create a custom hook which calls useReduxState, and re-use it in both components.

```js
// useLoginModalState.js

const useLoginModalState = () =>
  useReduxState({
    key: 'loginModal',
    initialState: {
      isOpen: false,
    },
    actions: {
      open: () => ({ isOpen: true }),
      close: () => ({ isOpen: false }),
    },
  })

export default useLoginModalState
```

```js
// ComponentOne.jsx

const ComponentOne = () => {
  const modal = useLoginModalState()
  return <button onClick={() => modal.open()}>Log In</button>
}
```

```js
// LoginModal.jsx

const LoginModal = () => {
  const modal = useLoginModalState()
  return (
    <Modal isOpen={modal.state.isOpen} onRequestClose={() => modal.close()}>
      Log In
    </Modal>
  )
}
```

### useWatchForTruthy

A very simple hook which waits for a value to become truthy, and then fires a callback.

```js
const RandomComponent = () => {
  const [value, setValue] = useState(false)

  useWatchForTruthy(value, () => console.log('Hooray!'))

  return <button onClick={() => setValue(true)}>Trigger a console.log</button>
}
```

### useResource

A hook which gives you access to api methods on resources.

```js

const territoriesResource = useResource('territory')

useEffect(() => {
  territoriesResource.findAll({
    // query of some kind
  })
}, [])

return (
  <div>
    {(territoriesResource.getDataAsArray() || []).map(...)}
  </div>
)

```

This hook is composed of other pieces of this readme, so can be most usefully interpreted by reading its tests and the methods it exposes. It's still in flux, and its API will likely change.

### useCache

A hook which provides access to a simple global cache. This is most useful for caching network requests in conjunction with `useResource`. The cache is stored in redux, using `useReduxState`.

```js
const territoriesCache = useCache('territories')
territoriesCache.set({
  key: 'some_key',
  value: [
    /* An array of territories */
  ],
})

territoriesCache.get('some_key')
```

I would advise *ONLY* using the cache for network requests - any other shared state should be build using `useReduxState`