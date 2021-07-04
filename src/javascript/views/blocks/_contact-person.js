import React from 'react'

import Contact from 'javascript/components/contact'

export default (block, assets, props) => {
  const image = assets['page-images'] && assets['page-images'].find(d => block.images[0].imageIds.includes(d.id))
  return (
    <div>
      {block.title &&
        <h2 className="content-block__heading">{block.title}</h2>
      }
      <Contact image={image} name={block.name} jobTitle={block.jobTitle} phone={block.phone} email={block.email} />
    </div>
  )
}