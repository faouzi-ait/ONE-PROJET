import React from 'react'
import Gallery from 'javascript/components/gallery'

export default (block, assets, props) => (
  <Gallery carousel={true} items={ block.images.map(i => {
    const image = assets['page-images'] && assets['page-images'].find(d => i.imageIds.includes(d.id))
    return { ...i, image }
  })} />
)