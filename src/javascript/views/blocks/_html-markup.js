import React from 'react'
import DOMPurify from 'dompurify'
DOMPurify.setConfig({ ADD_ATTR: ['target'] })

export default (block, assets) => (
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }}></div>
)