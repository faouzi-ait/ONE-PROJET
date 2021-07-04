import useThrottledQuery from './use-throttled-query'

const useAutosuggestLogic = <T>({
  query,
}: {
  query: (...args: any[]) => Promise<T[]>
}) => {
  const {
    data: suggestions,
    updateCache,
    sendQuery,
    isLoading,
  } = useThrottledQuery({
    query,
  })

  const onClear = () => updateCache([])

  return {
    fetchSuggestions: sendQuery,
    onClear,
    suggestions: suggestions || [],
    isLoading,
  }
}

export default useAutosuggestLogic
