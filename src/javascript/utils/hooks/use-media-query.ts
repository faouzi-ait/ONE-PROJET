import { useState, useEffect, useRef } from 'react'

const useMediaQuery = query => {
  const [isQueryTrue, setIsQueryTrue] = useState(window.matchMedia(query).matches)
  const media = useRef(null)

  const onResize = ({ matches }) => setIsQueryTrue(matches)

  useEffect(() => {
    media.current = window.matchMedia(query)
    media.current.addListener(onResize)

    return () => {
      media.current.removeListener(onResize)
    }
  }, [query])

  return isQueryTrue
}

export default useMediaQuery
