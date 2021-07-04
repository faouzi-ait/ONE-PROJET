import React, { useState, useEffect } from 'react'

export const useLazyLoadImage = ({
  src,
  placeholderSrc,
}: {
  src: string
  placeholderSrc: string
}) => {
  const [hasImageLoaded, setHasImageLoaded] = useState(false)
  useEffect(() => {
    if (src) {
      const img = new Image()
      img.onload = () => {
        setHasImageLoaded(true)
      }
      img.src = src
    }
  }, [src])
  return hasImageLoaded ? src : placeholderSrc
}

const LazyLoadImage: React.FC<{
  src: string
  placeholderSrc: string
  children: (src: string) => any
}> = ({ src, placeholderSrc, children }) => {
  const image = useLazyLoadImage({ src, placeholderSrc })
  return children(image)
}

export default LazyLoadImage