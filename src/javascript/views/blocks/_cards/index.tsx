import React from 'react'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import cardsClientVariables from './variables'
import getGridClass from 'javascript/utils/helper-functions/get-grid-class'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import { PageImageType } from 'javascript/types/ModelTypes'

// Components
import Card from 'javascript/components/card'

const Cards: BlockFunction<Props['block']> = ({
  assets,
  block,
  cardsCV
}) => {
  return (
    <div className={`grid grid--${getGridClass(block.numberOfItems)}`}>
      {block.pages.map(v => {
        const image = assets['page-images'] && assets['page-images'].find(d => v.imageIds.includes(d.id))
        return (
          <Card key={v.id} title={v.title}
            description={v.description}
            url={v.url}
            tags={v.label && [{ id: v.id, name: v.label }]}
            image={{src:image && image?.file.url}} 
            classes={cardsCV.cardClasses} 
            size={cardsCV.cardSize}
          />
      )
      })}
    </div>
  )
}

const CardsBlock: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedCardsBlock
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default CardsBlock

const enhance = compose(
  withClientVariables('cardsCV', cardsClientVariables),
)

const EnhancedCardsBlock = enhance(Cards)

interface Props {
  block: any
  assets: {
    'page-images': PageImageType[]
  }
  cardsCV: any
}