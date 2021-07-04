import React from 'react'

import Card from 'javascript/components/card'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import cardsClientVariables from 'javascript/views/blocks/_cards/variables'

const RelatedPagesCards = (props) => {
  const cardsCV = useClientVariables(cardsClientVariables)
  return props.render(props.block.pages.map((v, i) => {
    const image = props.assets['page-images'] && props.assets['page-images'].find(d => v.imageIds.includes(d.id))
    return <Card 
      key={i} 
      title={v.title} 
      tags={[{id:v.id,name:v.label}]} 
      image={{src:image && image.file.url}} 
      url={v.url} 
      classes={cardsCV.cardClasses} 
      size={cardsCV.cardSize}
      />
  }))
}

export default RelatedPagesCards