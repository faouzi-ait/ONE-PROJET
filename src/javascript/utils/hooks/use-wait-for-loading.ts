import { useEffect, useState } from 'react'

export type WaitForLoadingStateType = {
  finished: FinishedWaitingType
  onCompletion: OnCompletionType
  waitFor: WaitForType
  reset: ResetType
}

type OnCompletionType = (callbackFn: () => void) => void
type WaitForType = (name: string) => void
type FinishedWaitingType = (name: string | null) => void
type CallBackType = { handler: () => void }
type ResetType = (runOnCompletion?: boolean) => void

const useWaitForLoading = (callback = () => {}) => {

  const [watchers, setWatchers] = useState({})
  const [onCompletionHandler, setOnCompletionHandler] = useState<CallBackType>({ handler: callback })

  const onCompletion: OnCompletionType = (callbackFn = () => {}) => {
    setOnCompletionHandler({ handler: callbackFn })
  }

  const waitFor: WaitForType = (name) => {
    setWatchers((watchers) => {
      const update = {...watchers}
      update[name] = { status: 'waiting' }
      return update
    })
  }

  const reset: ResetType = (runOnCompletion = false) => {
    if (runOnCompletion) {
      onCompletionHandler.handler()
    }
    setWatchers({})
  }

  const finished: FinishedWaitingType = (name) => {
    if (name === null) {
      reset(true)
    } else {
      setWatchers((watchers) => {
        const update = {...watchers}
        update[name] = { status: 'completed' }
        return update
      })
    }
  }

  useEffect(() => {
    // This `default-runner` handles components that include withWaitForLoadingDiv, but due to current `theme.features` no waitFor calls are made.
    waitFor('default-runner')
    setTimeout(() => {
      finished('default-runner')
    }, 50)
  }, [])

  useEffect(() => {
    if (Object.keys(watchers).length > 0) {
      const allCompleted = Object.keys(watchers).reduce((acc, key) => {
        return !acc ? false : watchers[key].status === 'completed'
      }, true)
      if (allCompleted) {
        onCompletionHandler.handler()
      }
    }
  }, [JSON.stringify(watchers)])

  return {
    onCompletion,
    waitFor,
    finished,
    reset
  }
}

export default useWaitForLoading
