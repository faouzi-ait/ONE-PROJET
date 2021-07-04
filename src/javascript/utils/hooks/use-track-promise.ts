/**
 * A handy pattern for tracking the state of promises without having to get
 * too verbose in the component itself.
 */
import useEnumApiLogic from './use-enum-api-logic'

interface Options {
  onSuccess?: () => void
}

export const useTrackPromise = (options: Options = {}) => {
  const {
    reportError,
    reportFulfilled,
    reportStarted,
    state: { status, data },
  } = useEnumApiLogic()
  const trackPromise = (promise: Promise<any>) => {
    reportStarted()
    return promise
      .then(res => {
        reportFulfilled(res)
        if (options.onSuccess) {
          options.onSuccess()
        }
      })
      .catch(e => {
        reportError(e)
      })
  }
  return {
    status,
    data,
    trackPromise,
  }
}
