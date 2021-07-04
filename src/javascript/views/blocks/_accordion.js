import React from 'react'
import ShowHide from 'javascript/components/show-hide'

const BlockAccordion = ({accordions}) => (
  <div>
    {accordions.map((a, key) => (
      <ShowHide key={key} title={a.title}>
    	  <div class="wysiwyg" dangerouslySetInnerHTML={{ __html: a.content }}></div>
      </ShowHide>
    ))}
  </div>
)

export default BlockAccordion
