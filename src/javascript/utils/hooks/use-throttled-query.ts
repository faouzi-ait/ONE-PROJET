import useEnumApiLogic from './use-enum-api-logic'
import useAsyncProcessChecker from './use-async-process-checker'

const useThrottledQuery = <T>({
  query,
}: {
  query: (...args: any[]) => Promise<T>
}): {
  data: T
  sendQuery: (...args: any[]) => Promise<T>
  updateCache: (newItem: T) => void
  isLoading: boolean
} => {
  const {
    reportError,
    reportFulfilled,
    reportStarted,
    state: { data, status },
    updateCache,
  } = useEnumApiLogic()

  const processChecker = useAsyncProcessChecker()

  const sendQuery = (...args) => {
    const thisProcessId = processChecker.begin()
    reportStarted()
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        if (processChecker.checkIfShouldContinue(thisProcessId) && query(...args)) {
          query(...args)
            .then(res => {
              reportFulfilled(res)
              resolve(res)
            })
            .catch(e => {
              reportError(e)
              reject(e)
            })
        }
      }, 300)
    })
  }
  return { data, sendQuery, updateCache, isLoading: status === 'loading' }
}

export default useThrottledQuery
