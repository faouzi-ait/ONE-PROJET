import React from 'react'

export default (block, assets, props) => {
  return (
    <div className="logos grid grid--four">
      {block.images.map(v => {
        const image = assets['page-images'] && assets['page-images'].find(d => v.imageIds.includes(d.id))
        return (
          <div>
            <img src={image.file.url} />
          </div>
        )
      })}
    </div>
  )
}