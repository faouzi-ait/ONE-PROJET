import { useEffect } from 'react'
import uuid from 'uuid/v4'
import useEnumApiLogic from './use-enum-api-logic'
import useLocalState from './use-local-state'

interface QueueItem {
  id: string
  query: (...args: any[]) => Promise<any>
  onSuccess?: () => void
}

interface Actions {
  addToQueue: (query: QueueItem['query'], onSuccess?: () => void) => void
  removeFromQueue: () => void
}

const useApiQueue = (
  { onError } = { onError: () => {} },
): {
  status: ReturnType<typeof useEnumApiLogic>['state']['status']
  addToQueue: Actions['addToQueue']
} => {
  const {
    state: { queue },
    addToQueue,
    removeFromQueue,
  } = useLocalState<{ queue: QueueItem[] }, Actions, {}>({
    initialState: { queue: [] },
    actions: {
      addToQueue: (state, query, onSuccess) => ({
        ...state,
        queue: [...state.queue, { id: uuid(), query, onSuccess }],
      }),
      removeFromQueue: state => ({ ...state, queue: state.queue.slice(1) }),
    },
  })

  const {
    state: { status },
    reportError,
    reportFulfilled,
    reportStarted,
  } = useEnumApiLogic()

  useEffect(() => {
    if (queue.length > 0 && (status === 'fulfilled' || status === 'idle')) {
      reportStarted()
      queue[0]
        .query()
        .then(() => {
          removeFromQueue()
          reportFulfilled(null)
          if (queue[0].onSuccess) {
            queue[0].onSuccess()
          }
        })
        .catch(() => {
          reportError()
          onError()
        })
    }
  }, [queue.map(({ id }) => id).join(), status])

  const resolvedStatus =
    status !== 'fulfilled' ? status : queue.length > 0 ? 'loading' : 'fulfilled'

  return { addToQueue, status: resolvedStatus }
}

export default useApiQueue
