import api from 'javascript/utils/api'
import useEnumApiLogic from './use-enum-api-logic'

const useApi = query => {
  const {
    state,
    reportError,
    reportFulfilled,
    reportStarted,
  } = useEnumApiLogic()
  return [
    state,
    (...args) => {
      reportStarted()
      return query(api)(...args)
        .then(result => {
          reportFulfilled(result)
          return result
        })
        .catch(reportError)
    },
  ]
}

export default useApi
