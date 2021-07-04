import React from 'react'

export default (block, assets, props) => {
  return (
    <div>
      {block.title && <h2 className="content-block__heading">{block.title}</h2>}
      <div className="wysiwyg" dangerouslySetInnerHTML={{__html: block.content}}></div>
    </div>
  )
}

