import useEnumApiLogic from 'javascript/utils/hooks/use-enum-api-logic'
import { useEffect } from 'react'

const usePreloadQuery = <Data>({
  query,
  onError = error => {},
}: {
  query: () => Promise<Data>
  onError?: (e: Error) => void
}): [Data, ReturnType<typeof useEnumApiLogic>['state']['status']] => {
  const {
    state: { status, data },
    reportError,
    reportFulfilled,
    reportStarted,
  } = useEnumApiLogic()

  useEffect(() => {
    reportStarted()
    query()
      .then(reportFulfilled)
      .catch(e => {
        reportError(e)
        onError(e)
      })
  }, [])

  return [data, status]
}

export default usePreloadQuery
