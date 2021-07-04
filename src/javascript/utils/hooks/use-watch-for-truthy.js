import { useEffect } from 'react'
import useLocalState from './use-local-state'

const useWatchForTruthy = (value, callback) => {
  const {
    state: { isFirstRun, prevValue },
    setPrevValue,
  } = useWatchForTruthyState()

  useEffect(() => {
    if (!isFirstRun && !prevValue && value) {
      callback()
    }
    setPrevValue(value)
    /* eslint-disable-next-line */
  }, [value])
}

export default useWatchForTruthy

const useWatchForTruthyState = () =>
  useLocalState({
    initialState: {
      prevValue: null,
      isFirstRun: true,
    },
    actions: {
      setPrevValue: (state, payload) => ({
        ...state,
        prevValue: payload,
        isFirstRun: false,
      }),
    },
  })
